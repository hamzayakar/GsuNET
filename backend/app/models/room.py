"""
Room/Venue model for event locations
"""
from sqlalchemy import Column, Integer, String, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base


class Room(Base):
    """Room/Venue model"""
    __tablename__ = "rooms"

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
