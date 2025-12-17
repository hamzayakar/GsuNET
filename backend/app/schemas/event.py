"""
Event Pydantic schemas for request/response validation
"""
from __future__ import annotations

from pydantic import BaseModel, Field, field_validator
from typing import Optional, TYPE_CHECKING
from datetime import datetime
from app.models.event import EventStatus

if TYPE_CHECKING:
    from app.schemas.club import ClubResponse


# Base schema
class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_datetime: datetime
    duration: int = Field(..., ge=30, le=360, description="Event duration in minutes (30-360)")
    location: Optional[str] = None
    expected_capacity: Optional[int] = None
    max_capacity: Optional[int] = None
    image_url: Optional[str] = None
    members_only: bool = False

    @field_validator('duration')
    @classmethod
    def validate_duration(cls, v):
        """Ensure duration is in valid range (30-360 minutes = 0.5-6 hours)"""
        if not 30 <= v <= 360:
            raise ValueError('Duration must be between 30 and 360 minutes (0.5 to 6 hours)')
        return v


# Schema for creating an event
class EventCreate(EventBase):
    club_id: int
    room_id: Optional[int] = None


# Schema for updating an event
class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_datetime: Optional[datetime] = None
    duration: Optional[int] = Field(None, ge=30, le=360, description="Event duration in minutes (30-360)")
    location: Optional[str] = None
    expected_capacity: Optional[int] = None
    max_capacity: Optional[int] = None
    image_url: Optional[str] = None
    room_id: Optional[int] = None
    members_only: Optional[bool] = None


# Schema for event response
class EventResponse(EventBase):
    id: int
    club_id: int
    room_id: Optional[int]
    status: EventStatus
    rejection_reason: Optional[str]
    end_time: datetime  # Calculated from event_datetime + duration
    created_at: datetime
    approved_by_id: Optional[int]
    registration_count: int = 0
    members_only: bool = False
    club: Optional[ClubResponse] = None

    class Config:
        from_attributes = True


# Schema for event approval
class EventApproval(BaseModel):
    status: EventStatus
    rejection_reason: Optional[str] = None
