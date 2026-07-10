from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum

class VideoStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"

class DetectionBase(BaseModel):
    timestamp: datetime
    detected_class: str
    confidence: float
    image_url: Optional[str] = None

class DetectionCreate(DetectionBase):
    video_id: str

class Detection(DetectionBase):
    id: str

class VideoBase(BaseModel):
    filename: str
    uploaded_at: datetime = Field(default_factory=datetime.now)

class VideoCreate(VideoBase):
    pass

class Video(VideoBase):
    id: str
    status: VideoStatus = VideoStatus.pending
    detections: List[Detection] = []
