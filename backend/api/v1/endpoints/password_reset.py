from datetime import timedelta
from typing import Any, Optional
from fastapi import APIRouter, HTTPException
from jose import jwt, JWTError
from core import security
from core.config import settings
from core.email import send_email
from db.mongodb import get_database
from schemas.password_reset import PasswordResetRequest, PasswordReset

router = APIRouter()

RESET_TOKEN_EXPIRE_MINUTES = 30
FRONTEND_URL = "http://localhost:5173"


def _create_reset_token(email: str) -> str:
    """Create a short-lived JWT specifically for password resets."""
    return security.create_access_token(
        subject=email,
        expires_delta=timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES),
    )


def _decode_reset_token(token: str) -> Optional[str]:
    """Decode a password-reset token, return the email or None."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


@router.post("/forgot-password")
async def forgot_password(body: PasswordResetRequest) -> Any:
    """
    Request a password reset.
    Always returns success (so attackers can't enumerate valid emails).
    If the email exists AND SMTP is configured, sends a reset link.
    """
    db = get_database()
    user = await db.users.find_one({"email": body.email})

    if user:
        token = _create_reset_token(body.email)
        reset_link = f"{FRONTEND_URL}/reset-password?token={token}"

        await send_email(
            subject="Password Reset — GuardianAI",
            recipients=[body.email],
            body=(
                f"Hello {user.get('full_name', 'Agent')},\n\n"
                f"A password reset was requested for your account.\n\n"
                f"Click the link below to set a new access key:\n"
                f"{reset_link}\n\n"
                f"This link expires in {RESET_TOKEN_EXPIRE_MINUTES} minutes.\n\n"
                f"If you did not request this, you can safely ignore this email.\n\n"
                f"— GuardianAI Security"
            ),
        )

    # Always return success for security (don't reveal if email exists)
    return {
        "message": "If an account with that email exists, a reset link has been sent."
    }


@router.post("/reset-password")
async def reset_password(body: PasswordReset) -> Any:
    """
    Reset password using the token from the email link.
    """
    email = _decode_reset_token(body.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    db = get_database()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    new_hash = await security.get_password_hash(body.new_password)
    await db.users.update_one(
        {"email": email},
        {"$set": {"hashed_password": new_hash}},
    )

    return {"message": "Password has been reset successfully. You can now log in."}
