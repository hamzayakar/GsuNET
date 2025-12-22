"""
Room management routes with smart recommendation system
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Union
from datetime import date, time, datetime, timedelta

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, require_role
from app.models import Room, User, UserRole, RoomSchedule
from app.schemas import RoomCreate, RoomUpdate, RoomResponse, RoomRecommendationQuery, RoomRecommendationResponse, RoomConflict

router = APIRouter(prefix="/rooms", tags=["Rooms"])


@router.post("/", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
async def create_room(
    room_data: RoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """
    Create a new room (admin only)

    Args:
        room_data: Room creation data
        db: Database session
        current_user: Current authenticated user (must be admin)

    Returns:
        Created room object

    Raises:
        HTTPException: If room name already exists
    """
    # Check if room already exists
    existing_room = db.query(Room).filter(Room.name == room_data.name).first()
    if existing_room:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room name already exists"
        )

    # Create new room
    new_room = Room(**room_data.dict())

    db.add(new_room)
    db.commit()
    db.refresh(new_room)

    return new_room


@router.get("/", response_model=List[RoomResponse])
async def list_rooms(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    List all rooms

    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session

    Returns:
        List of rooms
    """
    rooms = db.query(Room).offset(skip).limit(limit).all()
    return rooms


@router.get("/recommend", response_model=Union[List[RoomResponse], RoomRecommendationResponse])
async def recommend_rooms(
    capacity: int = Query(..., description="Required capacity for the event"),
    event_date: Optional[date] = Query(None, description="Event date for conflict checking"),
    start_time: Optional[time] = Query(None, description="Event start time"),
    duration: Optional[int] = Query(None, ge=30, le=360, description="Event duration in minutes (30-360)"),
    max_capacity: Optional[int] = Query(None, description="Max capacity for 24-hour rule"),
    db: Session = Depends(get_db)
):
    """
    Smart room recommendation with optional conflict checking

    **Basic Mode** (capacity only):
    - GET /api/v1/rooms/recommend?capacity=100
    - Returns list of rooms with capacity >= 100

    **Enhanced Mode** (conflict-aware + 24-hour rule):
    - GET /api/v1/rooms/recommend?capacity=100&event_date=2025-12-20&start_time=14:00&duration=120&max_capacity=150
    - Returns rooms without conflicts + conflict information for unavailable rooms
    - If event is <24 hours away, marks rooms with capacity < max_capacity * 0.25 as disabled

    Args:
        capacity: Required capacity for the event
        event_date: Optional - Event date for conflict checking
        start_time: Optional - Event start time
        duration: Optional - Event duration in minutes
        max_capacity: Optional - Max capacity for 24-hour rule check
        db: Database session

    Returns:
        List[RoomResponse] if only capacity provided (backward compatible)
        RoomRecommendationResponse if date/time provided (conflict-aware)
    """
    if capacity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Capacity must be greater than 0"
        )

    # Get all rooms with sufficient capacity
    suitable_rooms = db.query(Room).filter(
        Room.capacity >= capacity,
        Room.is_available == True
    ).order_by(Room.capacity).all()

    # BASIC MODE: If no date/time provided, return old behavior (backward compatible)
    if not event_date or not start_time or not duration:
        if not suitable_rooms:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No available rooms found with capacity >= {capacity}"
            )
        return suitable_rooms

    # ENHANCED MODE: Conflict-aware recommendation
    # Calculate end time
    # Convert time to datetime for calculation
    dummy_datetime = datetime.combine(event_date, start_time)
    end_datetime = dummy_datetime + timedelta(minutes=duration)
    end_time = end_datetime.time()

    # Get day of week (0=Monday, 6=Sunday)
    day_of_week = event_date.weekday()

    # Calculate hours until event (24-hour rule check)
    now = datetime.now()
    event_datetime_full = datetime.combine(event_date, start_time)
    hours_until_event = (event_datetime_full - now).total_seconds() / 3600

    # 24-hour rule: If event is less than 24 hours away, minimum room capacity is max_capacity * 0.25
    min_capacity_for_last_minute = None
    if max_capacity and hours_until_event < 24:
        min_capacity_for_last_minute = max_capacity * 0.25

    available_rooms = []
    conflicted_rooms = []
    disabled_rooms = []
    conflicts = []

    for room in suitable_rooms:
        # Check for conflicts in this room's schedule
        has_conflict = False

        # Check recurring blocks (weekly classes)
        recurring_conflicts = db.query(RoomSchedule).filter(
            and_(
                RoomSchedule.room_id == room.id,
                RoomSchedule.is_recurring == True,
                RoomSchedule.day_of_week == day_of_week,
                or_(
                    # Event starts during existing block
                    and_(
                        RoomSchedule.start_time <= start_time,
                        RoomSchedule.end_time > start_time
                    ),
                    # Event ends during existing block
                    and_(
                        RoomSchedule.start_time < end_time,
                        RoomSchedule.end_time >= end_time
                    ),
                    # Event completely contains existing block
                    and_(
                        RoomSchedule.start_time >= start_time,
                        RoomSchedule.end_time <= end_time
                    )
                )
            )
        ).all()

        if recurring_conflicts:
            has_conflict = True
            for conflict in recurring_conflicts:
                conflicts.append(RoomConflict(
                    room_id=room.id,
                    room_name=room.name,
                    conflict_type=conflict.block_type.value.upper(),
                    conflict_title=conflict.title,
                    time_range=f"{conflict.start_time.strftime('%H:%M')}-{conflict.end_time.strftime('%H:%M')}",
                    is_recurring=True,
                    specific_date=None
                ))

        # Check one-time event blocks (specific date)
        event_conflicts = db.query(RoomSchedule).filter(
            and_(
                RoomSchedule.room_id == room.id,
                RoomSchedule.is_recurring == False,
                RoomSchedule.specific_date == event_date,
                or_(
                    and_(
                        RoomSchedule.start_time <= start_time,
                        RoomSchedule.end_time > start_time
                    ),
                    and_(
                        RoomSchedule.start_time < end_time,
                        RoomSchedule.end_time >= end_time
                    ),
                    and_(
                        RoomSchedule.start_time >= start_time,
                        RoomSchedule.end_time <= end_time
                    )
                )
            )
        ).all()

        if event_conflicts:
            has_conflict = True
            for conflict in event_conflicts:
                conflicts.append(RoomConflict(
                    room_id=room.id,
                    room_name=room.name,
                    conflict_type=conflict.block_type.value.upper(),
                    conflict_title=conflict.title,
                    time_range=f"{conflict.start_time.strftime('%H:%M')}-{conflict.end_time.strftime('%H:%M')}",
                    is_recurring=False,
                    specific_date=event_date
                ))

        # Check 24-hour rule
        # If event is MORE than 24 hours away: disable rooms that are >25% larger than needed (avoid wasting large rooms)
        # If event is LESS than 24 hours away: allow all rooms (emergency/last-minute exception)
        is_disabled_by_24h_rule = False
        disable_reason = None
        if hours_until_event >= 24 and max_capacity and room.capacity > max_capacity * 1.25:
            is_disabled_by_24h_rule = True
            disable_reason = f"Room capacity ({room.capacity}) is more than 25% larger than max capacity ({max_capacity}) - Please select a more appropriately sized room for better resource utilization"

        if is_disabled_by_24h_rule:
            # Room is disabled due to 24-hour rule
            from app.schemas import DisabledRoom
            disabled_rooms.append(DisabledRoom(
                id=room.id,
                name=room.name,
                capacity=room.capacity,
                location=room.location,
                description=room.description,
                features=room.features,
                is_available=room.is_available,
                disable_reason=disable_reason
            ))
        elif has_conflict:
            conflicted_rooms.append({
                "id": room.id,
                "name": room.name,
                "capacity": room.capacity,
                "location": room.location,
                "description": room.description,
                "features": room.features,
                "is_available": room.is_available
            })
        else:
            available_rooms.append(room)

    # Build response message
    if available_rooms:
        message = f"{len(available_rooms)} conflict-free room(s) found"
    elif conflicted_rooms:
        message = f"No conflict-free rooms available. {len(conflicted_rooms)} room(s) with conflicts (may be overridden by admin/advisor)"
    elif disabled_rooms:
        if hours_until_event >= 24:
            message = f"No recommended rooms available. {len(disabled_rooms)} room(s) disabled (too large for better resource utilization - select a more appropriately sized room)"
        else:
            message = f"No recommended rooms available. {len(disabled_rooms)} room(s) disabled"
    else:
        message = f"No rooms found with capacity >= {capacity}"

    return RoomRecommendationResponse(
        available_rooms=available_rooms,
        conflicted_rooms=conflicted_rooms if conflicted_rooms else None,
        disabled_rooms=disabled_rooms if disabled_rooms else None,
        conflicts=conflicts if conflicts else None,
        has_conflicts=len(conflicts) > 0,
        hours_until_event=hours_until_event if hours_until_event else None,
        message=message
    )


@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(
    room_id: int,
    db: Session = Depends(get_db)
):
    """
    Get room by ID

    Args:
        room_id: Room ID
        db: Database session

    Returns:
        Room object

    Raises:
        HTTPException: If room not found
    """
    room = db.query(Room).filter(Room.id == room_id).first()

    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    return room


@router.put("/{room_id}", response_model=RoomResponse)
async def update_room(
    room_id: int,
    room_data: RoomUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """
    Update a room (admin only)

    Args:
        room_id: Room ID
        room_data: Room update data
        db: Database session
        current_user: Current authenticated user (must be admin)

    Returns:
        Updated room object

    Raises:
        HTTPException: If room not found
    """
    room = db.query(Room).filter(Room.id == room_id).first()

    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    # Update room fields
    for field, value in room_data.dict(exclude_unset=True).items():
        setattr(room, field, value)

    db.commit()
    db.refresh(room)

    return room


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """
    Delete a room (admin only)

    Args:
        room_id: Room ID
        db: Database session
        current_user: Current authenticated user (must be admin)

    Raises:
        HTTPException: If room not found
    """
    room = db.query(Room).filter(Room.id == room_id).first()

    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    db.delete(room)
    db.commit()
