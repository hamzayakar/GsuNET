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


# Schema for enhanced room recommendation response
class RoomRecommendationResponse(BaseModel):
    """Enhanced recommendation with conflict checking"""
    available_rooms: List[RoomResponse]  # Rooms with no conflicts
    conflicted_rooms: Optional[List[dict]] = None  # Rooms with conflicts (capacity match but time conflict)
    conflicts: Optional[List[RoomConflict]] = None  # Detailed conflict information
    has_conflicts: bool = False
    message: str  # "3 available rooms found" or "No conflict-free rooms, showing alternatives"
