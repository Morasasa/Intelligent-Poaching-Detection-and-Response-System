from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from api import deps
from db.mongodb import get_database
from schemas.alert import Alert, AlertStatus
from schemas.user import User
from services.email_service import EmailService

router = APIRouter()
email_service = EmailService()

@router.post("/test-email")
async def send_test_email(
    current_user: User = Depends(deps.RoleChecker(["admin", "officer"]))
) -> Any:
    """
    Send a test email to the configured OFFICER_EMAIL.
    """
    try:
        await email_service.send_test_email_async()
        return {"status": "success", "message": f"Test email sent to {email_service.officer_email}"}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Test email failed: {exc}")

@router.get("/", response_model=List[Alert])
async def read_alerts(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.RoleChecker(["admin", "officer"]))
) -> Any:
    """
    Retrieve alerts. Admin and Officer only.
    """
    db = get_database()
    cursor = db.alerts.find().sort("created_at", -1).skip(skip).limit(limit)
    alerts = await cursor.to_list(length=limit)
    return [Alert(**a, id=str(a["_id"])) for a in alerts]

@router.get("/{alert_id}", response_model=Alert)
async def read_alert(
    alert_id: str,
    current_user: User = Depends(deps.RoleChecker(["admin", "officer"]))
) -> Any:
    """
    Retrieve specific alert by ID.
    """
    db = get_database()
    alert = await db.alerts.find_one({"alert_id": alert_id})
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return Alert(**alert, id=str(alert["_id"]))

@router.put("/{alert_id}/resolve", response_model=Alert)
async def resolve_alert(
    alert_id: str,
    current_user: User = Depends(deps.RoleChecker(["admin", "officer"]))
) -> Any:
    """
    Mark an alert as resolved.
    """
    db = get_database()
    alert = await db.alerts.find_one({"alert_id": alert_id})
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    await db.alerts.update_one(
        {"alert_id": alert_id},
        {"$set": {"status": AlertStatus.resolved.value}}
    )
    
    updated_alert = await db.alerts.find_one({"alert_id": alert_id})
    email_service.send_resolution_email_background(
        alert_type=updated_alert["alert_type"],
        alert_id=updated_alert["alert_id"],
        resolved_by=current_user.email,
    )
    return Alert(**updated_alert, id=str(updated_alert["_id"]))
