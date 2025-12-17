"""
Event model for club activities and events
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum as SQLEnum, CheckConstraint, Index, Boolean
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
        CheckConstraint('duration >= 30', name='check_duration_min'),
        CheckConstraint('duration <= 360', name='check_duration_max'),
        Index('idx_event_club_status', 'club_id', 'status'),
        Index('idx_event_status_datetime', 'status', 'event_datetime'),
    )

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)

    # Date and time
    event_datetime = Column(DateTime(timezone=True), nullable=False, index=True)
    duration = Column(Integer, nullable=False)  # Duration in minutes (30-360)
    end_time = Column(DateTime(timezone=True), nullable=False)  # Calculated from event_datetime + duration
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Location and capacity
    location = Column(String, nullable=True)
    expected_capacity = Column(Integer, nullable=True)
    max_capacity = Column(Integer, nullable=True)

    # Status and approval
    status = Column(SQLEnum(EventStatus), default=EventStatus.PENDING, nullable=False, index=True)
    rejection_reason = Column(Text, nullable=True)

    # Access control
    members_only = Column(Boolean, default=False, nullable=False)

    # Foreign keys
    club_id = Column(Integer, ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="SET NULL"), nullable=True)
    approved_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    club = relationship("Club", back_populates="events")
    room = relationship("Room", back_populates="events")
    approved_by = relationship("User", foreign_keys=[approved_by_id])
    registrations = relationship("EventRegistration", back_populates="event")
    schedule_block = relationship("RoomSchedule", back_populates="event", uselist=False, cascade="all, delete-orphan")

    @property
    def registration_count(self):
        """Get the current number of registrations for this event"""
        return len(self.registrations)

    def __repr__(self):
        return f"<Event {self.title}>"
