"""
Event Registration routes for managing user event registrations
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models import EventRegistration, Event, User, EventStatus, UserRole
from app.schemas import (
    EventRegistrationCreate,
    EventRegistrationResponse,
    EventRegistrationListResponse,
    EventRegistrationWithEventResponse,
)

router = APIRouter(prefix="/events", tags=["Event Registrations"])


@router.post("/{event_id}/register", response_model=EventRegistrationResponse, status_code=status.HTTP_201_CREATED)
async def register_for_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Register current user for an event

    Args:
        event_id: Event ID to register for
        db: Database session
        current_user: Current authenticated user

    Returns:
        Created event registration object

    Raises:
        HTTPException: If event not found, not approved, at capacity, or already registered
    """
    # Check if event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Check if event is approved
    if event.status != EventStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only register for approved events"
        )

    # Check if event is members-only
    if event.members_only:
        from app.models import ClubJoinRequest, JoinRequestStatus

        # Check if user is a member of the club (approved join request)
        is_member = db.query(ClubJoinRequest).filter(
            ClubJoinRequest.user_id == current_user.id,
            ClubJoinRequest.club_id == event.club_id,
            ClubJoinRequest.status == JoinRequestStatus.APPROVED
        ).first() is not None

        is_manager = any(club.id == event.club_id for club in current_user.managed_clubs)

        if not is_member and not is_manager and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This event is for club members only"
            )

    # Check event capacity
    if event.max_capacity:
        current_registrations = db.query(EventRegistration).filter(
            EventRegistration.event_id == event_id
        ).count()

        if current_registrations >= event.max_capacity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Event is at full capacity"
            )

    # Create registration
    try:
        registration = EventRegistration(
            user_id=current_user.id,
            event_id=event_id
        )
        db.add(registration)
        db.commit()
        db.refresh(registration)

        return registration
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already registered for this event"
        )


@router.delete("/{event_id}/unregister", status_code=status.HTTP_204_NO_CONTENT)
async def unregister_from_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Unregister current user from an event

    Args:
        event_id: Event ID to unregister from
        db: Database session
        current_user: Current authenticated user

    Raises:
        HTTPException: If registration not found
    """
    registration = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id,
        EventRegistration.user_id == current_user.id
    ).first()

    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )

    db.delete(registration)
    db.commit()


@router.get("/{event_id}/registrations", response_model=List[EventRegistrationResponse])
async def get_event_registrations(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get list of participants for an event (for club managers, advisors, and admins)

    Args:
        event_id: Event ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of event registrations with user info

    Raises:
        HTTPException: If event not found or unauthorized
    """
    # Check if event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Authorization: club manager of the event's club, advisor, or admin
    if current_user.role not in [UserRole.ADVISOR, UserRole.ADMIN]:
        if current_user.role == UserRole.CLUB_MANAGER:
            # Check if user manages the club that owns this event
            user_manages_club = any(club.id == event.club_id for club in current_user.managed_clubs)
            if not user_manages_club:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have permission to view registrations for this event"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to view event registrations"
            )

    # Get registrations with user info
    registrations = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id
    ).all()

    # Enrich with user information
    result = []
    for reg in registrations:
        reg_dict = {
            "id": reg.id,
            "user_id": reg.user_id,
            "event_id": reg.event_id,
            "attended": reg.attended,
            "registered_at": reg.registered_at,
            "user_name": reg.user.full_name,
            "user_email": reg.user.email,
        }
        result.append(EventRegistrationResponse(**reg_dict))

    return result


# New router for user registrations
user_router = APIRouter(prefix="/users", tags=["Event Registrations"])


@user_router.get("/me/registrations", response_model=List[EventRegistrationWithEventResponse])
async def get_my_registrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all events the current user is registered for

    Args:
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of registrations with full event details
    """
    from sqlalchemy.orm import joinedload

    registrations = db.query(EventRegistration).options(
        joinedload(EventRegistration.event).joinedload(Event.club)
    ).join(
        Event, EventRegistration.event_id == Event.id
    ).filter(
        EventRegistration.user_id == current_user.id
    ).order_by(
        Event.event_datetime.asc()
    ).all()

    return registrations
