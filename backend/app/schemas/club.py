"""
Club Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# Base schema
class ClubBase(BaseModel):
    name: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    contact_email: Optional[EmailStr] = None


# Schema for creating a club
class ClubCreate(ClubBase):
    manager_id: Optional[int] = None
    advisor_id: Optional[int] = None


# Schema for updating a club
class ClubUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    manager_id: Optional[int] = None
    advisor_id: Optional[int] = None


# Schema for club response
class ClubResponse(ClubBase):
    id: int
    manager_id: Optional[int]
    advisor_id: Optional[int]
    created_at: datetime
    member_count: int = 0
    follower_count: int = 0

    class Config:
        from_attributes = True
