"""
Sponsorship Request model for AI-powered sponsor-club matching system
Review6: Sponsor matching feature
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum as SQLEnum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class SponsorshipStatus(str, enum.Enum):
    """Sponsorship request status enumeration"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class SponsorshipType(str, enum.Enum):
    """Sponsorship type enumeration"""
    INDIVIDUAL = "individual"
    CORPORATE = "corporate"


class SponsorshipRequest(Base):
    """Sponsorship Request model"""
    __tablename__ = "sponsorship_requests"

    id = Column(Integer, primary_key=True, index=True)

    # Sponsor info
    sponsor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    company_name = Column(String(200), nullable=False)
    contact_info = Column(String(500), nullable=False)  # Phone, email, website
    vision = Column(Text, nullable=False)  # Company vision/mission
    sponsorship_goals = Column(Text, nullable=False)  # What they want to sponsor
    sponsorship_type = Column(SQLEnum(SponsorshipType), nullable=False)
    budget_range = Column(String(100), nullable=True)  # Optional budget range

    # Status tracking
    status = Column(SQLEnum(SponsorshipStatus), default=SponsorshipStatus.PENDING, nullable=False)
    rejection_reason = Column(Text, nullable=True)

    # Approval tracking
    approved_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    sponsor = relationship("User", foreign_keys=[sponsor_id], backref="sponsorship_requests")
    approved_by = relationship("User", foreign_keys=[approved_by_id])
    matches = relationship("SponsorshipMatch", back_populates="sponsorship_request", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index("idx_sponsorship_status", "status"),
        Index("idx_sponsorship_sponsor", "sponsor_id"),
    )

    def __repr__(self):
        return f"<SponsorshipRequest {self.company_name} - {self.status}>"
