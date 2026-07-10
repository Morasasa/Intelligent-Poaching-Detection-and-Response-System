from typing import Optional
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field

class AlertStatus(str, Enum):
    sent = "sent"
    viewed = "viewed"
    resolved = "resolved"

class AlertBase(BaseModel):
    detection_id: str
    alert_type: str
    officer_email: str
    status: AlertStatus = AlertStatus.sent
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AlertCreate(AlertBase):
    pass

class AlertInDB(AlertBase):
    alert_id: str

class Alert(AlertBase):
    id: str
    alert_id: str

    class Config:
        from_attributes = True
