"""
RoomSchedule model for weekly timetable and event blocks
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Time, Date, Enum as SQLEnum, CheckConstraint, Index, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class BlockType(str, enum.Enum):
    """Schedule block type enumeration"""
    CLASS = "class"          # Regular class/course
    EVENT = "event"          # Approved club event
    MAINTENANCE = "maintenance"  # Room maintenance
    RESERVED = "reserved"    # Reserved for special purposes


class RoomSchedule(Base):
    """
    Room schedule model for managing weekly timetable and event blocks.

    Supports two types of blocks:
    1. Recurring blocks (is_recurring=True): Weekly classes that repeat every week
       - Uses day_of_week (0=Monday, 6=Sunday)
       - Used for regular courses

    2. One-time blocks (is_recurring=False): Specific date events
       - Uses specific_date
       - Created when events are approved
       - Linked to event_id
    """
    __tablename__ = "room_schedules"
    __table_args__ = (
        # Time validation
        CheckConstraint('start_time < end_time', name='check_time_order'),
        # Indexes for performance
        Index('idx_schedule_room_day', 'room_id', 'day_of_week'),  # Recurring blocks
        Index('idx_schedule_room_date', 'room_id', 'specific_date'),  # Event blocks
        Index('idx_schedule_event', 'event_id'),  # Event lookup
    )

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)

    # Recurring blocks (weekly)
    day_of_week = Column(Integer, nullable=True)  # 0=Monday, 1=Tuesday, ..., 6=Sunday
    is_recurring = Column(Boolean, default=False, nullable=False, index=True)

    # Time slots
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    # Event blocks (one-time, specific date)
    specific_date = Column(Date, nullable=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=True, unique=True)

    # Content
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    block_type = Column(SQLEnum(BlockType), default=BlockType.CLASS, nullable=False)

    # Management
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    room = relationship("Room", back_populates="schedules")
    event = relationship("Event", back_populates="schedule_block", uselist=False)
    created_by_user = relationship("User", foreign_keys=[created_by])

    def __repr__(self):
        if self.is_recurring:
            return f"<RoomSchedule {self.title} - Day {self.day_of_week} {self.start_time}-{self.end_time}>"
        else:
            return f"<RoomSchedule {self.title} - {self.specific_date} {self.start_time}-{self.end_time}>"
