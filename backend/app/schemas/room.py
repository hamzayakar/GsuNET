"""
Room Pydantic schemas for request/response validation
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, time


# Base schema
class RoomBase(BaseModel):
    name: str
    description: Optional[str] = None
    capacity: int
    location: Optional[str] = None
    features: Optional[str] = None
    is_available: bool = True


# Schema for creating a room
class RoomCreate(RoomBase):
    pass


# Schema for updating a room
class RoomUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    capacity: Optional[int] = None
    location: Optional[str] = None
    features: Optional[str] = None
    is_available: Optional[bool] = None


# Schema for room response
class RoomResponse(RoomBase):
    id: int

    class Config:
        from_attributes = True


# Schema for room recommendation
class RoomRecommendationQuery(BaseModel):
    capacity: int


# Schema for conflict information in recommendation
class RoomConflict(BaseModel):
    """Information about a room scheduling conflict"""
    room_id: int
    room_name: str
    conflict_type: str  # "CLASS", "EVENT", "MAINTENANCE", "RESERVED"
    conflict_title: str
    time_range: str  # "14:00-16:00"
    is_recurring: bool  # True if weekly class, False if one-time event
    specific_date: Optional[date] = None


# Schema for disabled room (24-hour rule)
class DisabledRoom(BaseModel):
    """Room that meets capacity but is disabled due to 24-hour rule"""
    id: int
    name: str
    capacity: int
    location: Optional[str] = None
    description: Optional[str] = None
    features: Optional[str] = None
    is_available: bool
    disable_reason: str  # Why this room is disabled


# Schema for enhanced room recommendation response
class RoomRecommendationResponse(BaseModel):
    """Enhanced recommendation with conflict checking"""
    available_rooms: List[RoomResponse]  # Rooms with no conflicts and not disabled
    conflicted_rooms: Optional[List[dict]] = None  # Rooms with conflicts (capacity match but time conflict)
    disabled_rooms: Optional[List[DisabledRoom]] = None  # Rooms disabled by 24-hour rule
    conflicts: Optional[List[RoomConflict]] = None  # Detailed conflict information
    has_conflicts: bool = False
    hours_until_event: Optional[float] = None  # Hours until the event (for UI display)
    message: str  # "3 available rooms found" or "No conflict-free rooms, showing alternatives"
