"""
User Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
import re
from app.models.user import UserRole


# Base schema
class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=100)
    student_number: Optional[str] = Field(None, max_length=50)
    department: Optional[str] = Field(None, max_length=100)

    @field_validator('full_name', 'student_number', 'department')
    @classmethod
    def sanitize_text(cls, v: Optional[str]) -> Optional[str]:
        """
        Sanitize text fields to prevent injection attacks
        Reject inputs containing SQL keywords or script tags
        """
        if v is None:
            return v

        # Strip leading/trailing whitespace
        v = v.strip()

        # Check for common SQL injection patterns (case-insensitive)
        sql_patterns = [
            r'(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)',
            r'(--|;|\/\*|\*\/)',
            r'(\bUNION\b|\bEXEC\b|\bEXECUTE\b)',
        ]

        for pattern in sql_patterns:
            if re.search(pattern, v, re.IGNORECASE):
                raise ValueError('Input contains invalid characters or patterns')

        # Check for script tags
        if re.search(r'<script|javascript:|onerror=|onload=', v, re.IGNORECASE):
            raise ValueError('Input contains invalid characters or patterns')

        return v


# Schema for creating a user
class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role: UserRole = UserRole.STUDENT

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """
        Validate password strength:
        - At least 8 characters
        - At least 1 uppercase letter
        - At least 1 lowercase letter
        - At least 1 digit
        - At least 1 special character
        """
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')

        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')

        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')

        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')

        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)')

        return v


# Schema for updating a user
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    student_number: Optional[str] = None
    role: Optional[UserRole] = None

    class Config:
        from_attributes = True


# Schema for user list response (lighter than full UserResponse)
class UserListResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    student_number: Optional[str]
    department: Optional[str]
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True


# Schema for user response
class UserResponse(UserBase):
    id: int
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True


# Login schema
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Token response schema
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[UserRole] = None
