"""
Notification management routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models import Notification, User
from app.schemas import (
    NotificationResponse,
    NotificationUpdate,
    NotificationMarkAllRead,
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=List[NotificationResponse])
async def get_my_notifications(
    skip: int = 0,
    limit: int = 50,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user's notifications

    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        unread_only: If True, only return unread notifications
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of notifications ordered by created_at (newest first)
    """
    query = db.query(Notification).filter(
        Notification.user_id == current_user.id
    )

    if unread_only:
        query = query.filter(Notification.read == False)

    notifications = query.order_by(
        Notification.created_at.desc()
    ).offset(skip).limit(limit).all()

    return notifications


@router.get("/unread-count", response_model=dict)
async def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get count of unread notifications for current user

    Args:
        db: Database session
        current_user: Current authenticated user

    Returns:
        Dictionary with unread count
    """
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.read == False
    ).count()

    return {"unread_count": count}


@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Mark a notification as read

    Args:
        notification_id: Notification ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Updated notification object

    Raises:
        HTTPException: If notification not found or doesn't belong to user
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    # Authorization: only owner can mark as read
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to modify this notification"
        )

    notification.read = True
    db.commit()
    db.refresh(notification)

    return notification


@router.put("/mark-all-read", response_model=NotificationMarkAllRead)
async def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Mark all user's notifications as read

    Args:
        db: Database session
        current_user: Current authenticated user

    Returns:
        Count of marked notifications
    """
    # Update all unread notifications for current user
    updated_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.read == False
    ).update({"read": True})

    db.commit()

    return NotificationMarkAllRead(
        marked_count=updated_count,
        message=f"Marked {updated_count} notification(s) as read"
    )


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a notification

    Args:
        notification_id: Notification ID
        db: Database session
        current_user: Current authenticated user

    Raises:
        HTTPException: If notification not found or doesn't belong to user
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    # Authorization: only owner can delete
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this notification"
        )

    db.delete(notification)
    db.commit()
