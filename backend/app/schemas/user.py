"""
User Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


# Base schema
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    student_number: Optional[str] = None
    department: Optional[str] = None


# Schema for creating a user
class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.STUDENT


# Schema for updating a user
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    student_number: Optional[str] = None


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
