"""
Event Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.event import EventStatus


# Base schema
class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_datetime: datetime
    location: Optional[str] = None
    expected_capacity: Optional[int] = None
    max_capacity: Optional[int] = None
    image_url: Optional[str] = None


# Schema for creating an event
class EventCreate(EventBase):
    club_id: int
    room_id: Optional[int] = None


# Schema for updating an event
class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_datetime: Optional[datetime] = None
    location: Optional[str] = None
    expected_capacity: Optional[int] = None
    max_capacity: Optional[int] = None
    image_url: Optional[str] = None
    room_id: Optional[int] = None


# Schema for event response
class EventResponse(EventBase):
    id: int
    club_id: int
    room_id: Optional[int]
    status: EventStatus
    created_at: datetime
    approved_by_id: Optional[int]

    class Config:
        from_attributes = True


# Schema for event approval
class EventApproval(BaseModel):
    status: EventStatus
