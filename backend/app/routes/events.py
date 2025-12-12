"""
Event management routes with approval workflow
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, require_role
from app.models import Event, User, UserRole, EventStatus
from app.schemas import EventCreate, EventUpdate, EventResponse, EventApproval

router = APIRouter(prefix="/events", tags=["Events"])


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
    """
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

    Args:
        status: Filter by event status
        club_id: Filter by club ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session

    Returns:
        List of events
    """
    query = db.query(Event)

    if status:
        query = query.filter(Event.status == status)

    if club_id:
        query = query.filter(Event.club_id == club_id)

    # By default, show only approved events unless specifically filtered
    if status is None:
        query = query.filter(Event.status == EventStatus.APPROVED)

    events = query.offset(skip).limit(limit).all()
    return events


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    """
    Get event by ID

    Args:
        event_id: Event ID
        db: Database session

    Returns:
        Event object

    Raises:
        HTTPException: If event not found
    """
    event = db.query(Event).filter(Event.id == event_id).first()

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
        HTTPException: If event not found
    """
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
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
        HTTPException: If event not found
    """
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    db.delete(event)
    db.commit()
