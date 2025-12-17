"""
Event management routes with approval workflow
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, require_role
from app.models import Event, User, UserRole, EventStatus, Notification, NotificationType, EventRegistration
from app.schemas import EventCreate, EventUpdate, EventResponse, EventApproval

router = APIRouter(prefix="/events", tags=["Events"])


def auto_complete_past_events(db: Session):
    """
    Automatically mark approved events as completed if their event_datetime has passed

    Args:
        db: Database session
    """
    now = datetime.now(timezone.utc)

    # Find all approved events where event_datetime has passed
    past_events = db.query(Event).filter(
        Event.status == EventStatus.APPROVED,
        Event.event_datetime < now
    ).all()

    # Mark them as completed
    for event in past_events:
        event.status = EventStatus.COMPLETED

    if past_events:
        db.commit()

    return len(past_events)


def send_event_reminders(db: Session):
    """
    Send reminder notifications to users for events happening in ~3 days

    Finds events happening between 2.5 and 3.5 days from now and sends
    reminder notifications to all registered users who haven't received
    one yet.

    Args:
        db: Database session
    """
    now = datetime.now(timezone.utc)
    reminder_start = now + timedelta(days=2, hours=12)  # 2.5 days
    reminder_end = now + timedelta(days=3, hours=12)    # 3.5 days

    # Find approved events happening in the reminder window
    upcoming_events = db.query(Event).filter(
        Event.status == EventStatus.APPROVED,
        Event.event_datetime >= reminder_start,
        Event.event_datetime <= reminder_end
    ).all()

    notifications_created = 0

    for event in upcoming_events:
        # Get all registered users for this event
        registrations = db.query(EventRegistration).filter(
            EventRegistration.event_id == event.id
        ).all()

        for registration in registrations:
            # Check if user already has a reminder notification for this event
            existing_reminder = db.query(Notification).filter(
                Notification.user_id == registration.user_id,
                Notification.notification_type == NotificationType.EVENT_REMINDER,
                Notification.message.contains(f"event/{event.id}")  # Check if notification is for this event
            ).first()

            if not existing_reminder:
                # Create reminder notification
                notification = Notification(
                    title=f"Reminder: {event.title}",
                    message=f"Your registered event '{event.title}' is happening in 3 days on {event.event_datetime.strftime('%B %d, %Y')}. Don't forget to attend!||EVENT:{event.id}||",
                    notification_type=NotificationType.EVENT_REMINDER,
                    user_id=registration.user_id,
                    read=False
                )
                db.add(notification)
                notifications_created += 1

    if notifications_created > 0:
        db.commit()

    return notifications_created


@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_data: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new event (status: pending by default)

    Args:
        event_data: Event creation data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Created event object

    Raises:
        HTTPException: If club manager tries to create event for a club they don't manage
    """
    # Authorization check: club managers can only create events for their clubs
    if current_user.role == UserRole.CLUB_MANAGER:
        user_manages_club = any(club.id == event_data.club_id for club in current_user.managed_clubs)
        if not user_manages_club:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only create events for clubs you manage"
            )

    # Create new event with pending status
    new_event = Event(
        **event_data.dict(),
        status=EventStatus.PENDING
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return new_event


@router.get("/", response_model=List[EventResponse])
async def list_events(
    status: Optional[EventStatus] = None,
    club_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    List events with optional filtering

    Automatically marks past approved events as completed before returning results.

    Args:
        status: Filter by event status
        club_id: Filter by club ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session

    Returns:
        List of events
    """
    # Auto-complete past events before fetching
    auto_complete_past_events(db)

    # Send event reminders for upcoming events
    send_event_reminders(db)

    query = db.query(Event).options(joinedload(Event.club))

    if status:
        query = query.filter(Event.status == status)

    if club_id:
        query = query.filter(Event.club_id == club_id)

    # Sort by event datetime (upcoming events first)
    query = query.order_by(Event.event_datetime.asc())

    events = query.offset(skip).limit(limit).all()
    return events


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    """
    Get event by ID

    Automatically marks past approved events as completed before returning.

    Args:
        event_id: Event ID
        db: Database session

    Returns:
        Event object

    Raises:
        HTTPException: If event not found
    """
    # Auto-complete past events before fetching
    auto_complete_past_events(db)

    event = db.query(Event).options(joinedload(Event.club)).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    return event


@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: int,
    event_data: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update an event

    Args:
        event_id: Event ID
        event_data: Event update data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Updated event object

    Raises:
        HTTPException: If event not found or unauthorized
    """
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Authorization check: only the club manager who manages this event's club or admin can update
    if current_user.role != UserRole.ADMIN:
        # Check if the user manages the club that owns this event
        user_manages_club = any(club.id == event.club_id for club in current_user.managed_clubs)
        if not user_manages_club:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update this event"
            )

    # Update event fields
    for field, value in event_data.dict(exclude_unset=True).items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)

    return event


@router.put("/{event_id}/approve", response_model=EventResponse)
async def approve_event(
    event_id: int,
    approval_data: EventApproval,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADVISOR, UserRole.ADMIN]))
):
    """
    Approve or reject an event (advisor/admin only)

    Args:
        event_id: Event ID
        approval_data: Approval status
        db: Database session
        current_user: Current authenticated user (must be advisor or admin)

    Returns:
        Updated event object

    Raises:
        HTTPException: If event not found
    """
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Update event status and approver
    event.status = approval_data.status
    event.approved_by_id = current_user.id

    # Add rejection reason if provided
    if approval_data.rejection_reason:
        event.rejection_reason = approval_data.rejection_reason

    db.commit()
    db.refresh(event)

    return event


@router.put("/{event_id}/cancel", response_model=EventResponse)
async def cancel_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Cancel an approved event

    Admin can cancel any event, manager/advisor can cancel their club's events.
    Sends notifications to all registered users.

    Args:
        event_id: Event ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Updated event object with cancelled status

    Raises:
        HTTPException: If event not found or unauthorized
    """
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Authorization: admin can cancel any event, manager/advisor only their club's events
    if current_user.role != UserRole.ADMIN:
        # Check if user manages the club that owns this event
        user_manages_club = any(club.id == event.club_id for club in current_user.managed_clubs)
        # Also check if user is advisor of the club
        is_advisor = current_user.role == UserRole.ADVISOR and event.club.advisor_id == current_user.id

        if not user_manages_club and not is_advisor:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to cancel this event"
            )

    # Update event status to cancelled
    event.status = EventStatus.CANCELLED

    # Get all registered users for this event
    registrations = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id
    ).all()

    # Send notification to all registered users
    for registration in registrations:
        notification = Notification(
            title=f"Event Cancelled: {event.title}",
            message=f"The event '{event.title}' scheduled for {event.event_datetime.strftime('%B %d, %Y')} has been cancelled.||EVENT:{event.id}||",
            notification_type=NotificationType.EVENT_CANCELLED,
            user_id=registration.user_id,
            read=False
        )
        db.add(notification)

    db.commit()
    db.refresh(event)

    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.CLUB_MANAGER, UserRole.ADMIN]))
):
    """
    Delete an event (club manager or admin only)

    Args:
        event_id: Event ID
        db: Database session
        current_user: Current authenticated user

    Raises:
        HTTPException: If event not found or unauthorized
    """
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Authorization check: only the club manager who manages this event's club or admin can delete
    if current_user.role != UserRole.ADMIN:
        # Check if the user manages the club that owns this event
        user_manages_club = any(club.id == event.club_id for club in current_user.managed_clubs)
        if not user_manages_club:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to delete this event"
            )

    db.delete(event)
    db.commit()
