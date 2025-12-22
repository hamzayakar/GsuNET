"""
Club Join Request model for managing club membership requests
"""
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum as SQLEnum, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class JoinRequestStatus(str, enum.Enum):
    """Join request status enumeration"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class ClubJoinRequest(Base):
    """Club Join Request model"""
    __tablename__ = "club_join_requests"
    __table_args__ = (
        UniqueConstraint('user_id', 'club_id', 'status', name='unique_pending_request'),
    )

    id = Column(Integer, primary_key=True, index=True)

    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    club_id = Column(Integer, ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False)

    # Request details
    message = Column(Text, nullable=True)  # Optional message from user
    status = Column(SQLEnum(JoinRequestStatus), default=JoinRequestStatus.PENDING, nullable=False)
    rejection_reason = Column(Text, nullable=True)

    # Timestamps
    requested_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    club = relationship("Club")
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_id])

    def __repr__(self):
        return f"<ClubJoinRequest user={self.user_id} club={self.club_id} status={self.status}>"
