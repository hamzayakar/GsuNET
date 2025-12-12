"""
Room Pydantic schemas for request/response validation
"""
from pydantic import BaseModel
from typing import Optional


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
