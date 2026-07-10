from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from api import deps
from db.mongodb import get_database
from schemas.detection import Detection
from schemas.user import User

router = APIRouter()

@router.get("/", response_model=List[Detection])
async def read_detections(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Retrieve detections. Allowed for all authenticated users.
    """
    db = get_database()
    cursor = db.detections.find().sort("detected_at", -1).skip(skip).limit(limit)
    detections = await cursor.to_list(length=limit)
    return [Detection(**d, id=str(d["_id"])) for d in detections]
