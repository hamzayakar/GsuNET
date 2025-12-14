"""
Event model for club activities and events
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum as SQLEnum, CheckConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class EventStatus(str, enum.Enum):
    """Event status enumeration"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class Event(Base):
    """Event model"""
    __tablename__ = "events"
    __table_args__ = (
        CheckConstraint('expected_capacity > 0', name='check_expected_capacity_positive'),
        CheckConstraint('max_capacity > 0', name='check_max_capacity_positive'),
        CheckConstraint('expected_capacity <= max_capacity', name='check_capacity_valid'),
        Index('idx_event_club_status', 'club_id', 'status'),
        Index('idx_event_status_datetime', 'status', 'event_datetime'),
    )

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)

    # Date and time
    event_datetime = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Location and capacity
    location = Column(String, nullable=True)
    expected_capacity = Column(Integer, nullable=True)
    max_capacity = Column(Integer, nullable=True)

    # Status and approval
    status = Column(SQLEnum(EventStatus), default=EventStatus.PENDING, nullable=False, index=True)
    rejection_reason = Column(Text, nullable=True)

    # Foreign keys
    club_id = Column(Integer, ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="SET NULL"), nullable=True)
    approved_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    club = relationship("Club", back_populates="events")
    room = relationship("Room", back_populates="events")
    approved_by = relationship("User", foreign_keys=[approved_by_id])
    registrations = relationship("EventRegistration", back_populates="event")

    def __repr__(self):
        return f"<Event {self.title}>"
