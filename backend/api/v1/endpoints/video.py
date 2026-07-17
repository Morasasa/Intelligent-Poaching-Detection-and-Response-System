import os
import cv2
import asyncio
import aiofiles
from typing import List
from datetime import datetime
from uuid import uuid4
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, Depends, HTTPException
from api import deps
from schemas.user import User
from schemas.video import Video, VideoStatus
from db.mongodb import get_database
from core.config import settings
from core.paths import UPLOADS_DIR
from services.detection_service import detection_service

router = APIRouter()

ALLOWED_MEDIA_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff", "video/mp4", "video/x-msvideo", "video/quicktime"}
MAX_UPLOAD_SIZE_MB = 50


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: User = Depends(deps.RoleChecker(["admin", "ranger"]))
):
    # Validate file type
    if file.content_type not in ALLOWED_MEDIA_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Allowed: MP4, AVI, MOV, JPG, PNG, WebP."
        )

    video_id = str(uuid4())
    # Sanitize filename - strip directory components and dangerous characters
    raw_name = os.path.basename(file.filename or "upload.jpg")
    secure_name = "".join(c for c in raw_name if c.isalnum() or c in "._-").strip()
    if not secure_name:
        secure_name = "upload.jpg"
    
    # Ensure upload directory exists
    file_location = UPLOADS_DIR / f"{video_id}_{secure_name}"
    
    # Stream file to disk with size check
    max_bytes = MAX_UPLOAD_SIZE_MB * 1024 * 1024
    total_written = 0
    try:
        async with aiofiles.open(file_location, 'wb') as out_file:
            while content := await file.read(1024 * 1024):
                total_written += len(content)
                if total_written > max_bytes:
                    # Clean up oversized file
                    await out_file.close()
                    os.remove(file_location)
                    raise HTTPException(
                        status_code=413,
                        detail=f"File too large. Maximum allowed size is {MAX_UPLOAD_SIZE_MB}MB."
                    )
                await out_file.write(content)
    except HTTPException:
        raise
    except Exception:
        # Clean up on write failure
        if os.path.exists(file_location):
            os.remove(file_location)
        raise HTTPException(status_code=500, detail="Failed to save uploaded file.")
    
    db = get_database()
    image_url = f"/static/uploads/{video_id}_{secure_name}"
    video_doc = {
        "_id": video_id,
        "filename": file.filename,
        "user_id": current_user.id,
        "uploaded_at": datetime.now(),
        "status": VideoStatus.pending,
        "file_path": str(file_location),
        "image_url": image_url
    }
    
    try:
        await db.videos.insert_one(video_doc)
    except Exception:
        # Clean up file if DB insert fails
        if os.path.exists(file_location):
            os.remove(file_location)
        raise HTTPException(status_code=500, detail="Failed to register upload in database.")
    
    background_tasks.add_task(detection_service.process_video, video_id, str(file_location))
    
    return {"id": video_id, "status": "pending", "message": "Image uploaded and analysis started"}

@router.get("/list")
async def list_videos(
    current_user: User = Depends(deps.get_current_user)
):
    db = get_database()
    
    pipeline = [
        {"$match": {"user_id": current_user.id}},
        {"$lookup": {
            "from": "detections",
            "localField": "_id",
            "foreignField": "video_id",
            "as": "detections"
        }},
        {"$sort": {"uploaded_at": -1}},
        {"$limit": 100}
    ]
    
    videos = await db.videos.aggregate(pipeline).to_list(length=100)
    
    # Fix _id to id for frontend
    results = []
    for v in videos:
        v["id"] = str(v.pop("_id"))
        if "detections" in v:
            for d in v["detections"]:
                if "_id" in d:
                    d["id"] = str(d.pop("_id"))
                if "video_id" in d:
                    d["video_id"] = str(d["video_id"])
                # Alias fields for frontend backwards compatibility
                d["detected_class"] = d.get("object_type") or d.get("detected_class", "")
                d["confidence"] = d.get("confidence_score") or d.get("confidence", 0.0)
                d["image_url"] = d.get("frame_image_path") or d.get("image_url", "")
                d["timestamp"] = d.get("detected_at") or d.get("timestamp", "")
        results.append(v)
        
    return results

@router.delete("/clear")
async def clear_all_videos_and_detections(
    current_user: User = Depends(deps.RoleChecker(["admin", "ranger"]))
):
    db = get_database()

    user_videos = await db.videos.find({"user_id": current_user.id}).to_list(length=None)
    video_ids = [v["_id"] for v in user_videos]

    detection_docs = (
        await db.detections.find({"video_id": {"$in": video_ids}}).to_list(length=None)
        if video_ids
        else []
    )
    detection_ids = [d["detection_id"] for d in detection_docs if "detection_id" in d]

    if video_ids:
        await db.videos.delete_many({"_id": {"$in": video_ids}})
        await db.detections.delete_many({"video_id": {"$in": video_ids}})

    if detection_ids:
        await db.alerts.delete_many({"detection_id": {"$in": detection_ids}})
    
    # Clean up physical files in uploads and images
    for v_id in video_ids:
        for file_path in UPLOADS_DIR.glob(f"{v_id}_*"):
            try:
                file_path.unlink()
            except OSError:
                pass
                
    return {"status": "success", "message": "All previous detections and videos cleared."}
