"""
Room management routes with smart recommendation system
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, require_role
from app.models import Room, User, UserRole
from app.schemas import RoomCreate, RoomUpdate, RoomResponse, RoomRecommendationQuery

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


@router.get("/recommend", response_model=List[RoomResponse])
async def recommend_rooms(
    capacity: int = Query(..., description="Required capacity for the event"),
    db: Session = Depends(get_db)
):
    """
    Smart room recommendation based on required capacity

    This endpoint filters rooms that have sufficient capacity for the given requirement.
    Rooms are returned sorted by capacity (smallest suitable room first for efficiency).

    Args:
        capacity: Required capacity for the event
        db: Database session

    Returns:
        List of suitable rooms sorted by capacity

    Example:
        GET /api/v1/rooms/recommend?capacity=100
        Returns all rooms with capacity >= 100, sorted by capacity
    """
    if capacity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Capacity must be greater than 0"
        )

    # Query rooms with sufficient capacity and available status
    suitable_rooms = db.query(Room).filter(
        Room.capacity >= capacity,
        Room.is_available == True
    ).order_by(Room.capacity).all()

    if not suitable_rooms:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No available rooms found with capacity >= {capacity}"
        )

    return suitable_rooms


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
