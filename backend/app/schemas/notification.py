"""
Notification schemas for API request/response validation
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.models.notification import NotificationType


class NotificationBase(BaseModel):
    """Base notification schema"""
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1)
    notification_type: NotificationType


class NotificationCreate(NotificationBase):
    """Schema for creating a notification"""
    user_id: int


class NotificationUpdate(BaseModel):
    """Schema for updating a notification"""
    read: bool


class NotificationResponse(NotificationBase):
    """Schema for notification response"""
    id: int
    read: bool
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationMarkAllRead(BaseModel):
    """Schema for marking all notifications as read response"""
    marked_count: int
    message: str
