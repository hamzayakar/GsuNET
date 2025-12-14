"""
Password reset schemas
"""
from pydantic import BaseModel, EmailStr


class PasswordResetRequest(BaseModel):
    """Request password reset via email"""
    email: EmailStr


class PasswordReset(BaseModel):
    """Reset password with token"""
    token: str
    new_password: str
