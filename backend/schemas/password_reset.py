from pydantic import BaseModel, EmailStr, Field, validator
import re


class PasswordResetRequest(BaseModel):
    """Request a password reset — just needs the email."""
    email: EmailStr


class PasswordReset(BaseModel):
    """Actually reset the password — needs token + new password."""
    token: str
    new_password: str = Field(..., min_length=8)

    @validator('new_password')
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
