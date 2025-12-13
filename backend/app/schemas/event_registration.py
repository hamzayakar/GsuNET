"""
Event Registration schemas for API validation
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class EventRegistrationBase(BaseModel):
    """Base event registration schema"""
    pass


class EventRegistrationCreate(EventRegistrationBase):
    """Schema for creating event registration"""
    pass


class EventRegistrationResponse(EventRegistrationBase):
    """Schema for event registration response"""
    id: int
    user_id: int
    event_id: int
    attended: bool
    registered_at: datetime

    # User info (optional, for participant lists)
    user_name: Optional[str] = None
    user_email: Optional[str] = None

    class Config:
        from_attributes = True


class EventRegistrationListResponse(BaseModel):
    """Schema for event with registration status"""
    event_id: int
    title: str
    description: Optional[str]
    event_datetime: datetime
    location: Optional[str]
    club_name: Optional[str]
    registered_at: datetime
    attended: bool

    class Config:
        from_attributes = True
