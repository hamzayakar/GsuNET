"""
Scheduled background tasks (cron jobs)
These run on a schedule defined in worker.py
"""
import logging
from datetime import datetime, timedelta, timezone

from app.core.database import SessionLocal
from app.models import Event, EventStatus, EventRegistration, Notification, NotificationType

logger = logging.getLogger(__name__)


async def send_daily_event_reminders(ctx):
    """
    Daily cron job to send reminder notifications for events happening in ~3 days

    Runs daily at 9 AM (configured in worker.py)
    Finds events happening between 2.5 and 3.5 days from now and sends
    reminder notifications to all registered users who haven't received one yet.

    Args:
        ctx: ARQ context (provided by worker)
    """
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        reminder_start = now + timedelta(days=2, hours=12)  # 2.5 days
        reminder_end = now + timedelta(days=3, hours=12)    # 3.5 days

        # Find approved events happening in the reminder window
        upcoming_events = db.query(Event).filter(
            Event.status == EventStatus.APPROVED,
            Event.event_datetime >= reminder_start,
            Event.event_datetime <= reminder_end
        ).all()

        if not upcoming_events:
            logger.info("No events in reminder window (2.5-3.5 days)")
            return {
                "success": True,
                "count": 0,
                "message": "No events to remind about"
            }

        notifications_created = 0

        for event in upcoming_events:
            # Get all registered users for this event
            registrations = db.query(EventRegistration).filter(
                EventRegistration.event_id == event.id
            ).all()

            formatted_date = event.event_datetime.strftime('%B %d, %Y')

            for registration in registrations:
                # Check if user already has a reminder notification for this event
                existing_reminder = db.query(Notification).filter(
                    Notification.user_id == registration.user_id,
                    Notification.notification_type == NotificationType.EVENT_REMINDER,
                    Notification.message.contains(f"EVENT:{event.id}")
                ).first()

                if not existing_reminder:
                    # Create reminder notification
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

        logger.info(f"✅ Sent {notifications_created} event reminder notifications for {len(upcoming_events)} events")
        return {
            "success": True,
            "count": notifications_created,
            "events_count": len(upcoming_events)
        }

    except Exception as e:
        logger.error(f"❌ Failed to send daily event reminders: {e}")
        db.rollback()
        return {
            "success": False,
            "error": str(e)
        }

    finally:
        db.close()
