"""
Sponsorship model for club-sponsor relationships
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum as SQLEnum, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class SponsorshipStatus(str, enum.Enum):
    """Sponsorship status enumeration"""
    PENDING = "pending"
    NEGOTIATING = "negotiating"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"


class Sponsorship(Base):
    """Sponsorship model"""
    __tablename__ = "sponsorships"

    id = Column(Integer, primary_key=True, index=True)

    # Sponsor information
    sponsor_name = Column(String, nullable=False)
    sponsor_email = Column(String, nullable=True)
    sponsor_phone = Column(String, nullable=True)
    sponsor_company = Column(String, nullable=True)

    # Sponsorship details
    proposal_title = Column(String, nullable=False)
    proposal_description = Column(Text, nullable=True)
    sponsorship_amount = Column(Numeric(10, 2), nullable=True)
    sponsorship_type = Column(String, nullable=True)  # e.g., "financial", "in-kind"

    # Status
    status = Column(SQLEnum(SponsorshipStatus), default=SponsorshipStatus.PENDING, nullable=False)

    # Foreign keys
    club_id = Column(Integer, ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    club = relationship("Club", back_populates="sponsorships")

    def __repr__(self):
        return f"<Sponsorship {self.sponsor_company} -> {self.club.name}>"
