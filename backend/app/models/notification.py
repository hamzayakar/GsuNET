"""
Notification model for user notifications
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class NotificationType(str, enum.Enum):
    """Notification type enumeration"""
    EVENT_CREATED = "event_created"
    EVENT_UPDATED = "event_updated"
    EVENT_CANCELLED = "event_cancelled"
    EVENT_REMINDER = "event_reminder"
    EVENT_APPROVED = "event_approved"
    EVENT_REJECTED = "event_rejected"
    CLUB_UPDATE = "club_update"
    SPONSORSHIP_UPDATE = "sponsorship_update"


class Notification(Base):
    """Notification model"""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    # Notification content
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(SQLEnum(NotificationType), nullable=False)

    # Status
    read = Column(Boolean, default=False)

    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="notifications")

    def __repr__(self):
        return f"<Notification {self.title} for user={self.user_id}>"
