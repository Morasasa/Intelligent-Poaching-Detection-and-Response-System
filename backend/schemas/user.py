from typing import Optional
import re
from enum import Enum
from pydantic import BaseModel, EmailStr, validator, Field

class Role(str, Enum):
    admin = "admin"
    ranger = "ranger"
    officer = "officer"

class UserBase(BaseModel):
    email: EmailStr
    role: Role = Role.ranger
    full_name: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

    @validator('password')
    def validate_password(cls, v):
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDB(UserBase):
    hashed_password: str

class User(UserBase):
    id: str

    class Config:
        from_attributes = True
