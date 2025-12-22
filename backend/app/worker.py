"""
ARQ Worker Configuration
Run this worker to process background tasks

Usage:
    python -m app.worker

Or with arq command:
    arq app.worker.WorkerSettings
"""
import logging
from arq import cron
from arq.connections import RedisSettings

from app.core.redis import get_redis_settings
from app.tasks.notification_tasks import (
    send_notification_task,
    send_bulk_notifications_task,
    send_event_cancellation_notifications,
    send_event_reminder_notifications
)
from app.tasks.scheduled_tasks import send_daily_event_reminders

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


async def startup(ctx):
    """Called when worker starts"""
    logger.info("🚀 ARQ Worker starting up...")


async def shutdown(ctx):
    """Called when worker shuts down"""
    logger.info("🛑 ARQ Worker shutting down...")


class WorkerSettings:
    """
    ARQ Worker Settings
    Defines which tasks the worker can execute
    """

    # Redis connection settings
    redis_settings = get_redis_settings()

    # List of functions the worker can execute
    functions = [
        send_notification_task,
        send_bulk_notifications_task,
        send_event_cancellation_notifications,
        send_event_reminder_notifications
    ]

    # Worker configuration
    on_startup = startup
    on_shutdown = shutdown

    # Performance tuning
    max_jobs = 10  # Maximum concurrent jobs
    job_timeout = 300  # Job timeout in seconds (5 minutes)
    keep_result = 3600  # Keep job results for 1 hour

    # Cron jobs (scheduled tasks)
    # Send event reminders daily at 9 AM
    cron_jobs = [
        cron(send_daily_event_reminders, hour=9, minute=0)
    ]


# For running with `python -m app.worker` (simple wrapper)
if __name__ == '__main__':
    import sys

    logger.info("Starting ARQ worker...")
    logger.info("Note: For production, use: arq app.worker.WorkerSettings")

    # Run using arq CLI programmatically
    sys.argv = ['arq', 'app.worker.WorkerSettings']

    from arq.cli import cli
    cli()
