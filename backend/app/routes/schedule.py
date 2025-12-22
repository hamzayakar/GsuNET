"""
Room schedule management routes for weekly timetable and availability checking
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import date, time, datetime, timedelta

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, require_role
from app.models import RoomSchedule, Room, Event, User, UserRole, BlockType, EventStatus
from app.schemas.room_schedule import (
    RecurringBlockCreate,
    RoomScheduleUpdate,
    RoomScheduleResponse,
    RoomScheduleWithRoom,
    DailyScheduleRequest,
    DailyScheduleBlock,
    DailyScheduleResponse,
)

router = APIRouter(prefix="/schedule", tags=["Schedule"])


@router.post("/", response_model=RoomScheduleResponse, status_code=status.HTTP_201_CREATED)
async def create_recurring_block(
    block_data: RecurringBlockCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """
    Create a new recurring schedule block (admin only)

    This endpoint is used to add weekly recurring blocks like classes to the room schedule.
    Event blocks are automatically created when events are approved.

    Args:
        block_data: Recurring block creation data
        db: Database session
        current_user: Current authenticated user (must be admin)

    Returns:
        Created schedule block

    Raises:
        HTTPException: If room doesn't exist or conflict detected
    """
    # Verify room exists
    room = db.query(Room).filter(Room.id == block_data.room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Room with id {block_data.room_id} not found"
        )

    # Check for conflicts with existing recurring blocks
    conflict = db.query(RoomSchedule).filter(
        and_(
            RoomSchedule.room_id == block_data.room_id,
            RoomSchedule.is_recurring == True,
            RoomSchedule.day_of_week == block_data.day_of_week,
            or_(
                # New block starts during existing block
                and_(
                    RoomSchedule.start_time <= block_data.start_time,
                    RoomSchedule.end_time > block_data.start_time
                ),
                # New block ends during existing block
                and_(
                    RoomSchedule.start_time < block_data.end_time,
                    RoomSchedule.end_time >= block_data.end_time
                ),
                # New block completely contains existing block
                and_(
                    RoomSchedule.start_time >= block_data.start_time,
                    RoomSchedule.end_time <= block_data.end_time
                )
            )
        )
    ).first()

    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Schedule conflict detected with '{conflict.title}' on {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][conflict.day_of_week]} {conflict.start_time}-{conflict.end_time}"
        )

    # Create new recurring block
    new_block = RoomSchedule(
        room_id=block_data.room_id,
        title=block_data.title,
        description=block_data.description,
        block_type=block_data.block_type,
        start_time=block_data.start_time,
        end_time=block_data.end_time,
        is_recurring=True,
        day_of_week=block_data.day_of_week,
        created_by=current_user.id
    )

    db.add(new_block)
    db.commit()
    db.refresh(new_block)

    return new_block


@router.get("/recurring", response_model=List[RoomScheduleWithRoom])
async def list_recurring_blocks(
    room_id: Optional[int] = Query(None, description="Filter by room ID"),
    day_of_week: Optional[int] = Query(None, ge=0, le=6, description="Filter by day (0=Monday, 6=Sunday)"),
    db: Session = Depends(get_db)
):
    """
    List all recurring schedule blocks (weekly classes)

    Args:
        room_id: Optional room filter
        day_of_week: Optional day filter (0=Monday, 6=Sunday)
        db: Database session

    Returns:
        List of recurring blocks with room details
    """
    query = db.query(RoomSchedule).filter(RoomSchedule.is_recurring == True)

    if room_id:
        query = query.filter(RoomSchedule.room_id == room_id)
    if day_of_week is not None:
        query = query.filter(RoomSchedule.day_of_week == day_of_week)

    blocks = query.order_by(RoomSchedule.day_of_week, RoomSchedule.start_time).all()

    # Enrich with room details
    result = []
    for block in blocks:
        block_dict = {
            "id": block.id,
            "room_id": block.room_id,
            "title": block.title,
            "description": block.description,
            "block_type": block.block_type.value,
            "start_time": block.start_time,
            "end_time": block.end_time,
            "is_recurring": block.is_recurring,
            "day_of_week": block.day_of_week,
            "specific_date": block.specific_date,
            "event_id": block.event_id,
            "created_by": block.created_by,
            "created_at": block.created_at,
            "updated_at": block.updated_at,
            "room_name": block.room.name if block.room else None,
            "room_capacity": block.room.capacity if block.room else None
        }
        result.append(block_dict)

    return result


@router.get("/daily")
async def get_daily_schedule(
    schedule_date: date = Query(..., description="Date to get schedule for"),
    room_id: Optional[int] = Query(None, description="Filter by room ID"),
    db: Session = Depends(get_db)
):
    """
    Get daily schedule for a specific date (merged recurring + approved events)

    This endpoint merges:
    1. Recurring blocks for the day of week
    2. Approved event blocks for the specific date

    Args:
        schedule_date: Date to get schedule for
        room_id: Optional room filter
        db: Database session

    Returns:
        Daily schedule with all blocks
    """
    day_of_week = schedule_date.weekday()  # 0=Monday, 6=Sunday
    blocks = []

    # Get recurring blocks for this day of week
    recurring_query = db.query(RoomSchedule).filter(
        and_(
            RoomSchedule.is_recurring == True,
            RoomSchedule.day_of_week == day_of_week
        )
    )

    if room_id:
        recurring_query = recurring_query.filter(RoomSchedule.room_id == room_id)

    recurring_blocks = recurring_query.all()

    for block in recurring_blocks:
        blocks.append(DailyScheduleBlock(
            id=block.id,
            room_id=block.room_id,
            room_name=block.room.name if block.room else "Unknown",
            title=block.title,
            start_time=block.start_time,
            end_time=block.end_time,
            block_type=block.block_type.value,
            is_recurring=True,
            event_id=None
        ))

    # Get event blocks for this specific date
    event_query = db.query(RoomSchedule).filter(
        and_(
            RoomSchedule.is_recurring == False,
            RoomSchedule.specific_date == schedule_date
        )
    )

    if room_id:
        event_query = event_query.filter(RoomSchedule.room_id == room_id)

    event_blocks = event_query.all()

    for block in event_blocks:
        blocks.append(DailyScheduleBlock(
            id=block.id,
            room_id=block.room_id,
            room_name=block.room.name if block.room else "Unknown",
            title=block.title,
            start_time=block.start_time,
            end_time=block.end_time,
            block_type=block.block_type.value,
            is_recurring=False,
            event_id=block.event_id
        ))

    # Sort by start_time
    blocks.sort(key=lambda x: x.start_time)

    return DailyScheduleResponse(
        schedule_date=schedule_date,
        room_id=room_id,
        blocks=blocks,
        total_blocks=len(blocks)
    )


@router.put("/{block_id}", response_model=RoomScheduleResponse)
async def update_recurring_block(
    block_id: int,
    block_data: RoomScheduleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """
    Update a recurring schedule block (admin only)

    Only recurring blocks can be updated via this endpoint.
    Event blocks are managed through event lifecycle.

    Args:
        block_id: Block ID to update
        block_data: Update data
        db: Database session
        current_user: Current authenticated user (must be admin)

    Returns:
        Updated schedule block

    Raises:
        HTTPException: If block not found, is not recurring, or conflict detected
    """
    block = db.query(RoomSchedule).filter(RoomSchedule.id == block_id).first()
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Schedule block with id {block_id} not found"
        )

    if not block.is_recurring:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update event blocks via this endpoint. Use event management endpoints."
        )

    # Update fields
    update_data = block_data.dict(exclude_unset=True)

    # If time or day is being updated, check for conflicts
    if any(k in update_data for k in ['start_time', 'end_time', 'day_of_week']):
        new_start = update_data.get('start_time', block.start_time)
        new_end = update_data.get('end_time', block.end_time)
        new_day = update_data.get('day_of_week', block.day_of_week)

        conflict = db.query(RoomSchedule).filter(
            and_(
                RoomSchedule.id != block_id,  # Exclude current block
                RoomSchedule.room_id == block.room_id,
                RoomSchedule.is_recurring == True,
                RoomSchedule.day_of_week == new_day,
                or_(
                    and_(
                        RoomSchedule.start_time <= new_start,
                        RoomSchedule.end_time > new_start
                    ),
                    and_(
                        RoomSchedule.start_time < new_end,
                        RoomSchedule.end_time >= new_end
                    ),
                    and_(
                        RoomSchedule.start_time >= new_start,
                        RoomSchedule.end_time <= new_end
                    )
                )
            )
        ).first()

        if conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Schedule conflict detected with '{conflict.title}'"
            )

    for key, value in update_data.items():
        setattr(block, key, value)

    db.commit()
    db.refresh(block)

    return block


@router.delete("/{block_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recurring_block(
    block_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """
    Delete a recurring schedule block (admin only)

    Only recurring blocks can be deleted via this endpoint.
    Event blocks are automatically deleted when events are cancelled/rejected.

    Args:
        block_id: Block ID to delete
        db: Database session
        current_user: Current authenticated user (must be admin)

    Raises:
        HTTPException: If block not found or is not recurring
    """
    block = db.query(RoomSchedule).filter(RoomSchedule.id == block_id).first()
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Schedule block with id {block_id} not found"
        )

    if not block.is_recurring:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete event blocks via this endpoint. Event blocks are managed through event lifecycle."
        )

    db.delete(block)
    db.commit()

    return None
