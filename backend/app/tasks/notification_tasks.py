"""
Notification background tasks
These tasks are executed by ARQ worker asynchronously
"""
import logging
from typing import List, Dict
from datetime import datetime

from app.core.database import SessionLocal
from app.models import Notification, NotificationType, Event, EventRegistration, User

logger = logging.getLogger(__name__)


async def send_notification_task(
    ctx,
    user_id: int,
    title: str,
    message: str,
    notification_type: str
):
    """
    Background task to create a single notification

    Args:
        ctx: ARQ context (provided by worker)
        user_id: ID of user to notify
        title: Notification title
        message: Notification message
        notification_type: Type of notification (from NotificationType enum)
    """
    db = SessionLocal()
    try:
        # Convert string back to enum
        notif_type = NotificationType[notification_type]

        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notif_type,
            read=False
        )

        db.add(notification)
        db.commit()

        logger.info(f"✅ Created notification for user {user_id}: {title}")
        return {
            "success": True,
            "user_id": user_id,
            "title": title
        }

    except Exception as e:
        logger.error(f"❌ Failed to create notification for user {user_id}: {e}")
        db.rollback()
        return {
            "success": False,
            "user_id": user_id,
            "error": str(e)
        }

    finally:
        db.close()


async def send_bulk_notifications_task(
    ctx,
    notifications_data: List[Dict]
):
    """
    Background task to create multiple notifications at once

    Args:
        ctx: ARQ context
        notifications_data: List of notification dicts with keys:
            - user_id (int)
            - title (str)
            - message (str)
            - notification_type (str)
    """
    db = SessionLocal()
    try:
        notifications = []

        for notif_data in notifications_data:
            # Convert string back to enum
            notif_type = NotificationType[notif_data['notification_type']]

            notification = Notification(
                user_id=notif_data['user_id'],
                title=notif_data['title'],
                message=notif_data['message'],
                notification_type=notif_type,
                read=False
            )
            notifications.append(notification)

        db.add_all(notifications)
        db.commit()

        logger.info(f"✅ Created {len(notifications)} bulk notifications")
        return {
            "success": True,
            "count": len(notifications)
        }

    except Exception as e:
        logger.error(f"❌ Failed to create bulk notifications: {e}")
        db.rollback()
        return {
            "success": False,
            "error": str(e)
        }

    finally:
        db.close()


async def send_event_cancellation_notifications(
    ctx,
    event_id: int,
    event_title: str,
    event_datetime: str  # ISO format string
):
    """
    Background task to send cancellation notifications to all registered users

    Args:
        ctx: ARQ context
        event_id: ID of cancelled event
        event_title: Title of event
        event_datetime: Event date/time as ISO string
    """
    db = SessionLocal()
    try:
        # Get all registrations for the event
        registrations = db.query(EventRegistration).filter(
            EventRegistration.event_id == event_id
        ).all()

        if not registrations:
            logger.info(f"No registrations found for event {event_id}")
            return {
                "success": True,
                "count": 0,
                "message": "No users to notify"
            }

        # Parse datetime string
        from datetime import datetime
        event_dt = datetime.fromisoformat(event_datetime.replace('Z', '+00:00'))
        formatted_date = event_dt.strftime('%B %d, %Y')

        # Create notifications for all registered users
        notifications = []
        for registration in registrations:
            notification = Notification(
                title=f"Event Cancelled: {event_title}",
                message=f"The event '{event_title}' scheduled for {formatted_date} has been cancelled.||EVENT:{event_id}||",
                notification_type=NotificationType.EVENT_CANCELLED,
                user_id=registration.user_id,
                read=False
            )
            notifications.append(notification)

        db.add_all(notifications)
        db.commit()

        logger.info(f"✅ Sent {len(notifications)} event cancellation notifications for event {event_id}")
        return {
            "success": True,
            "count": len(notifications),
            "event_id": event_id
        }

    except Exception as e:
        logger.error(f"❌ Failed to send event cancellation notifications: {e}")
        db.rollback()
        return {
            "success": False,
            "error": str(e)
        }

    finally:
        db.close()


async def send_event_reminder_notifications(
    ctx,
    event_id: int
):
    """
    Background task to send reminder notifications 3 days before event

    Args:
        ctx: ARQ context
        event_id: ID of event to send reminders for
    """
    db = SessionLocal()
    try:
        # Get event details
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            logger.warning(f"Event {event_id} not found")
            return {
                "success": False,
                "error": "Event not found"
            }

        # Get all registrations
        registrations = db.query(EventRegistration).filter(
            EventRegistration.event_id == event_id
        ).all()

        if not registrations:
            logger.info(f"No registrations for event {event_id}")
            return {
                "success": True,
                "count": 0,
                "message": "No users to notify"
            }

        formatted_date = event.event_datetime.strftime('%B %d, %Y')
        notifications_created = 0

        for registration in registrations:
            # Check if reminder already exists
            existing_reminder = db.query(Notification).filter(
                Notification.user_id == registration.user_id,
                Notification.notification_type == NotificationType.EVENT_REMINDER,
                Notification.message.contains(f"EVENT:{event.id}")
            ).first()

            if not existing_reminder:
                notification = Notification(
                    title=f"Reminder: {event.title}",
                    message=f"Your registered event '{event.title}' is happening in 3 days on {formatted_date}. Don't forget to attend!||EVENT:{event.id}||",
                    notification_type=NotificationType.EVENT_REMINDER,
                    user_id=registration.user_id,
                    read=False
                )
                db.add(notification)
                notifications_created += 1

        db.commit()

        logger.info(f"✅ Sent {notifications_created} event reminder notifications for event {event_id}")
        return {
            "success": True,
            "count": notifications_created,
            "event_id": event_id
        }

    except Exception as e:
        logger.error(f"❌ Failed to send event reminder notifications: {e}")
        db.rollback()
        return {
            "success": False,
            "error": str(e)
        }

    finally:
        db.close()
