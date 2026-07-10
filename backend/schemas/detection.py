from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class DetectionBase(BaseModel):
    video_id: str
    object_type: str
    confidence_score: float
    timestamp_in_video: Optional[float] = None
    frame_image_path: Optional[str] = None
    detected_at: datetime = Field(default_factory=datetime.utcnow)

class DetectionCreate(DetectionBase):
    pass

class DetectionInDB(DetectionBase):
    detection_id: str

class Detection(DetectionBase):
    id: str

    class Config:
        from_attributes = True
