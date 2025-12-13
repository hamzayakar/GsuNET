"""
Event Registration model for tracking user event registrations
"""
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class EventRegistration(Base):
    """Event Registration model"""
    __tablename__ = "event_registrations"
    __table_args__ = (
        UniqueConstraint('user_id', 'event_id', name='unique_user_event_registration'),
    )

    id = Column(Integer, primary_key=True, index=True)

    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)

    # Registration details
    attended = Column(Boolean, default=False)
    registered_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="event_registrations")
    event = relationship("Event", back_populates="registrations")

    def __repr__(self):
        return f"<EventRegistration user={self.user_id} event={self.event_id}>"
