"""
Pydantic schemas for sponsorship requests
Review6: Sponsor matching feature
"""
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from typing import Optional


class SponsorshipStatus(str, Enum):
    """Sponsorship request status"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class SponsorshipType(str, Enum):
    """Sponsorship type"""
    INDIVIDUAL = "individual"
    CORPORATE = "corporate"


class UserBasicInfo(BaseModel):
    """Basic user information for nested responses"""
    id: int
    full_name: str
    email: str

    class Config:
        from_attributes = True


class ClubBasicInfo(BaseModel):
    """Basic club information for nested responses"""
    id: int
    name: str
    description: Optional[str] = None
    manager: Optional[UserBasicInfo] = None

    class Config:
        from_attributes = True


class SponsorshipRequestCreate(BaseModel):
    """Schema for creating a sponsorship request"""
    company_name: str = Field(..., min_length=2, max_length=200)
    contact_info: str = Field(..., min_length=5, max_length=500)
    vision: str = Field(..., min_length=10)
    sponsorship_goals: str = Field(..., min_length=10)
    sponsorship_type: SponsorshipType
    budget_range: str | None = Field(None, max_length=100)


class SponsorshipRequestResponse(BaseModel):
    """Schema for sponsorship request response"""
    id: int
    sponsor_id: int
    sponsor: Optional[UserBasicInfo] = None  # Include sponsor user info
    company_name: str
    contact_info: str
    vision: str
    sponsorship_goals: str
    sponsorship_type: SponsorshipType
    budget_range: str | None
    status: SponsorshipStatus
    rejection_reason: str | None
    approved_by_id: int | None
    approved_at: datetime | None
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True


class SponsorshipReviewRequest(BaseModel):
    """Schema for reviewing (approving/rejecting) a sponsorship request"""
    status: SponsorshipStatus
    rejection_reason: str | None = None


class SponsorshipMatchResponse(BaseModel):
    """Schema for sponsorship match response"""
    id: int
    sponsorship_request_id: int
    club_id: int
    club_name: str
    club: Optional[ClubBasicInfo] = None  # Include club details
    match_rank: int
    ai_reasoning: str
    created_at: datetime

    class Config:
        from_attributes = True


class SponsorshipDetailsResponse(BaseModel):
    """Schema for detailed sponsorship information (for club managers)"""
    id: int
    company_name: str
    contact_info: str
    vision: str
    sponsorship_goals: str
    sponsorship_type: SponsorshipType
    budget_range: str | None
    status: SponsorshipStatus
    created_at: datetime

    class Config:
        from_attributes = True
