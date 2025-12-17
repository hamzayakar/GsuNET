"""
Pydantic schemas for RoomSchedule API
"""
from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import time, date, datetime
from typing import Optional, List
from enum import Enum


class BlockTypeEnum(str, Enum):
    """Block type enumeration for API"""
    CLASS = "class"
    EVENT = "event"
    MAINTENANCE = "maintenance"
    RESERVED = "reserved"


class RoomScheduleBase(BaseModel):
    """Base schema for room schedule"""
    room_id: int = Field(..., gt=0, description="Room ID")
    title: str = Field(..., min_length=1, max_length=200, description="Block title (e.g., 'Calculus 101')")
    description: Optional[str] = Field(None, max_length=1000, description="Optional description")
    block_type: BlockTypeEnum = Field(default=BlockTypeEnum.CLASS, description="Type of schedule block")
    start_time: time = Field(..., description="Start time (HH:MM format)")
    end_time: time = Field(..., description="End time (HH:MM format)")

    @field_validator('start_time', 'end_time')
    @classmethod
    def validate_time_range(cls, v):
        """Ensure time is within school hours (07:00-22:00)"""
        if v < time(7, 0) or v > time(22, 0):
            raise ValueError('Time must be between 07:00 and 22:00 (school hours)')
        return v

    @model_validator(mode='after')
    def validate_time_order(self):
        """Ensure end_time > start_time"""
        if self.end_time <= self.start_time:
            raise ValueError('end_time must be after start_time')
        return self


class RecurringBlockCreate(RoomScheduleBase):
    """Schema for creating a recurring block (weekly classes)"""
    day_of_week: int = Field(..., ge=0, le=6, description="Day of week (0=Monday, 6=Sunday)")
    is_recurring: bool = Field(default=True, description="Must be True for recurring blocks")

    @field_validator('is_recurring')
    @classmethod
    def must_be_recurring(cls, v):
        """Ensure is_recurring is True"""
        if not v:
            raise ValueError('RecurringBlockCreate must have is_recurring=True')
        return v


class EventBlockCreate(RoomScheduleBase):
    """Schema for creating an event block (one-time, specific date) - Used internally"""
    specific_date: date = Field(..., description="Specific date for this block")
    event_id: int = Field(..., gt=0, description="Associated event ID")
    is_recurring: bool = Field(default=False, description="Must be False for event blocks")
    block_type: BlockTypeEnum = Field(default=BlockTypeEnum.EVENT, description="Must be EVENT type")


class RoomScheduleUpdate(BaseModel):
    """Schema for updating a schedule block (admin only)"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    day_of_week: Optional[int] = Field(None, ge=0, le=6)

    @field_validator('start_time', 'end_time')
    @classmethod
    def validate_time_range(cls, v):
        """Ensure time is within school hours"""
        if v and (v < time(7, 0) or v > time(22, 0)):
            raise ValueError('Time must be between 07:00 and 22:00')
        return v


class RoomScheduleResponse(BaseModel):
    """Schema for room schedule response"""
    id: int
    room_id: int
    title: str
    description: Optional[str]
    block_type: str
    start_time: time
    end_time: time
    is_recurring: bool
    day_of_week: Optional[int]
    specific_date: Optional[date]
    event_id: Optional[int]
    created_by: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class RoomScheduleWithRoom(RoomScheduleResponse):
    """Schedule response with room details"""
    room_name: Optional[str] = None
    room_capacity: Optional[int] = None


class ScheduleAvailabilityRequest(BaseModel):
    """Request schema for checking room availability"""
    schedule_date: date = Field(..., description="Date to check availability")
    start_time: time = Field(..., description="Desired start time")
    end_time: time = Field(..., description="Desired end time")
    room_id: Optional[int] = Field(None, gt=0, description="Filter by specific room (optional)")

    @model_validator(mode='after')
    def validate_time_order(self):
        """Ensure end_time > start_time"""
        if self.end_time <= self.start_time:
            raise ValueError('end_time must be after start_time')
        return self


class ConflictInfo(BaseModel):
    """Information about a scheduling conflict"""
    room_id: int
    room_name: str
    conflict_type: str  # "CLASS", "EVENT", "MAINTENANCE", "RESERVED"
    conflict_title: str
    time_range: str  # "14:00-16:00"
    specific_date: Optional[date] = None


class ScheduleAvailabilityResponse(BaseModel):
    """Response schema for availability check"""
    schedule_date: date
    requested_time_range: str  # "14:00-16:00"
    available_rooms: List[dict]  # Rooms with no conflicts
    conflicts: List[ConflictInfo]  # Rooms with conflicts
    message: str  # "3 available rooms found" or "No available rooms"


class DailyScheduleRequest(BaseModel):
    """Request schema for getting daily schedule"""
    schedule_date: date = Field(..., description="Date to get schedule for")
    room_id: Optional[int] = Field(None, gt=0, description="Filter by room (optional)")


class DailyScheduleBlock(BaseModel):
    """A single block in the daily schedule"""
    id: int
    room_id: int
    room_name: str
    title: str
    start_time: time
    end_time: time
    block_type: str
    is_recurring: bool
    event_id: Optional[int] = None


class DailyScheduleResponse(BaseModel):
    """Response for daily schedule (merged recurring + events)"""
    schedule_date: date
    room_id: Optional[int] = None
    blocks: List[DailyScheduleBlock]
    total_blocks: int
