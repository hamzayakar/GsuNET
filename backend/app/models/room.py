"""
Room/Venue model for event locations
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, CheckConstraint, Index
from sqlalchemy.orm import relationship
from app.core.database import Base


class Room(Base):
    """Room/Venue model"""
    __tablename__ = "rooms"
    __table_args__ = (
        CheckConstraint('capacity > 0', name='check_capacity_positive'),
        Index('idx_room_availability_capacity', 'is_available', 'capacity'),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    capacity = Column(Integer, nullable=False)
    location = Column(String, nullable=True)
    features = Column(Text, nullable=True)  # JSON string for features
    is_available = Column(Boolean, default=True)

    # Relationships
    events = relationship("Event", back_populates="room")

    def __repr__(self):
        return f"<Room {self.name} (capacity: {self.capacity})>"
