"""
Club join request schemas
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.club_join_request import JoinRequestStatus


class ClubJoinRequestCreate(BaseModel):
    """Schema for creating a club join request"""
    club_id: int
    message: Optional[str] = None


class ClubJoinRequestReview(BaseModel):
    """Schema for reviewing a club join request"""
    status: JoinRequestStatus  # APPROVED or REJECTED
    rejection_reason: Optional[str] = None


class ClubJoinRequestResponse(BaseModel):
    """Schema for club join request response"""
    id: int
    user_id: int
    club_id: int
    message: Optional[str]
    status: JoinRequestStatus
    rejection_reason: Optional[str]
    requested_at: datetime
    reviewed_at: Optional[datetime]
    reviewed_by_id: Optional[int]

    # Include related user and club info
    user: dict  # Will contain basic user info
    club: dict  # Will contain basic club info

    class Config:
        from_attributes = True
