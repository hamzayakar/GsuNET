"""
Club management routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, require_role
from app.models import Club, User, UserRole
from app.schemas import ClubCreate, ClubUpdate, ClubResponse

router = APIRouter(prefix="/clubs", tags=["Clubs"])


@router.post("/", response_model=ClubResponse, status_code=status.HTTP_201_CREATED)
async def create_club(
    club_data: ClubCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """
    Create a new club (admin only)

    Args:
        club_data: Club creation data
        db: Database session
        current_user: Current authenticated user (must be admin)

    Returns:
        Created club object

    Raises:
        HTTPException: If club name already exists
    """
    # Check if club already exists
    existing_club = db.query(Club).filter(Club.name == club_data.name).first()
    if existing_club:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Club name already exists"
        )

    # Create new club
    new_club = Club(**club_data.dict())

    db.add(new_club)
    db.commit()
    db.refresh(new_club)

    return new_club


@router.get("/", response_model=List[ClubResponse])
async def list_clubs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    List all clubs

    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session

    Returns:
        List of clubs with member and follower counts
    """
    from app.models import ClubJoinRequest, JoinRequestStatus

    clubs = db.query(Club).offset(skip).limit(limit).all()

    # Enrich with counts
    result = []
    for club in clubs:
        # Count approved join requests as members
        member_count = db.query(ClubJoinRequest).filter(
            ClubJoinRequest.club_id == club.id,
            ClubJoinRequest.status == JoinRequestStatus.APPROVED
        ).count()

        # Count followers
        follower_count = len(club.followers)

        result.append(ClubResponse(
            id=club.id,
            name=club.name,
            description=club.description,
            contact_email=club.contact_email,
            manager_id=club.manager_id,
            advisor_id=club.advisor_id,
            created_at=club.created_at,
            member_count=member_count,
            follower_count=follower_count
        ))

    return result


@router.get("/{club_id}", response_model=ClubResponse)
async def get_club(
    club_id: int,
    db: Session = Depends(get_db)
):
    """
    Get club by ID

    Args:
        club_id: Club ID
        db: Database session

    Returns:
        Club object

    Raises:
        HTTPException: If club not found
    """
    from app.models import ClubJoinRequest, JoinRequestStatus

    club = db.query(Club).filter(Club.id == club_id).first()

    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    # Count approved join requests as members
    member_count = db.query(ClubJoinRequest).filter(
        ClubJoinRequest.club_id == club.id,
        ClubJoinRequest.status == JoinRequestStatus.APPROVED
    ).count()

    # Count followers
    follower_count = len(club.followers)

    return ClubResponse(
        id=club.id,
        name=club.name,
        description=club.description,
        contact_email=club.contact_email,
        manager_id=club.manager_id,
        advisor_id=club.advisor_id,
        created_at=club.created_at,
        member_count=member_count,
        follower_count=follower_count
    )


@router.put("/{club_id}", response_model=ClubResponse)
async def update_club(
    club_id: int,
    club_data: ClubUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a club

    Args:
        club_id: Club ID
        club_data: Club update data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Updated club object

    Raises:
        HTTPException: If club not found or user not authorized
    """
    club = db.query(Club).filter(Club.id == club_id).first()

    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    # Check if user is club manager or admin
    if current_user.role not in [UserRole.ADMIN] and club.manager_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this club"
        )

    # Update club fields
    for field, value in club_data.dict(exclude_unset=True).items():
        setattr(club, field, value)

    db.commit()
    db.refresh(club)

    return club


@router.delete("/{club_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_club(
    club_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """
    Delete a club (admin only)

    Args:
        club_id: Club ID
        db: Database session
        current_user: Current authenticated user (must be admin)

    Raises:
        HTTPException: If club not found
    """
    club = db.query(Club).filter(Club.id == club_id).first()

    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    db.delete(club)
    db.commit()


# ============================================
# CLUB FOLLOW/UNFOLLOW ENDPOINTS
# ============================================

@router.post("/{club_id}/follow", status_code=status.HTTP_204_NO_CONTENT)
async def follow_club(
    club_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Follow a club

    Args:
        club_id: Club ID to follow
        db: Database session
        current_user: Current authenticated user

    Raises:
        HTTPException: If club not found or already following
    """
    # Check if club exists
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    # Check if already following
    if club in current_user.followed_clubs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already following this club"
        )

    # Add club to user's followed clubs
    current_user.followed_clubs.append(club)
    db.commit()


@router.delete("/{club_id}/unfollow", status_code=status.HTTP_204_NO_CONTENT)
async def unfollow_club(
    club_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Unfollow a club

    Args:
        club_id: Club ID to unfollow
        db: Database session
        current_user: Current authenticated user

    Raises:
        HTTPException: If club not found or not following
    """
    # Check if club exists
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    # Check if following
    if club not in current_user.followed_clubs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not following this club"
        )

    # Remove club from user's followed clubs
    current_user.followed_clubs.remove(club)
    db.commit()


@router.get("/{club_id}/followers", response_model=dict)
async def get_club_followers(
    club_id: int,
    db: Session = Depends(get_db)
):
    """
    Get club followers count and list

    Args:
        club_id: Club ID
        db: Database session

    Returns:
        Dictionary with follower count and list of follower names

    Raises:
        HTTPException: If club not found
    """
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    followers = [
        {
            "id": follower.id,
            "full_name": follower.full_name,
            "email": follower.email
        }
        for follower in club.followers
    ]

    return {
        "club_id": club_id,
        "club_name": club.name,
        "follower_count": len(followers),
        "followers": followers
    }


# Separate router for user-specific endpoints
user_clubs_router = APIRouter(prefix="/users", tags=["Clubs"])


@user_clubs_router.get("/me/followed-clubs", response_model=List[ClubResponse])
async def get_my_followed_clubs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get clubs that current user is following

    Args:
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of clubs user is following
    """
    from app.models import ClubJoinRequest, JoinRequestStatus

    followed_clubs = current_user.followed_clubs

    # Enrich with counts
    result = []
    for club in followed_clubs:
        # Count approved join requests as members
        member_count = db.query(ClubJoinRequest).filter(
            ClubJoinRequest.club_id == club.id,
            ClubJoinRequest.status == JoinRequestStatus.APPROVED
        ).count()

        # Count followers
        follower_count = len(club.followers)

        result.append(ClubResponse(
            id=club.id,
            name=club.name,
            description=club.description,
            contact_email=club.contact_email,
            manager_id=club.manager_id,
            advisor_id=club.advisor_id,
            created_at=club.created_at,
            member_count=member_count,
            follower_count=follower_count
        ))

    return result


@user_clubs_router.get("/me/managed-clubs", response_model=List[ClubResponse])
async def get_my_managed_clubs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get clubs that current user manages (as manager or advisor)

    Args:
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of clubs user manages
    """
    from app.models import ClubJoinRequest, JoinRequestStatus

    # Get clubs where user is manager or advisor
    managed_clubs = db.query(Club).filter(
        (Club.manager_id == current_user.id) | (Club.advisor_id == current_user.id)
    ).all()

    # Enrich with counts
    result = []
    for club in managed_clubs:
        # Count approved join requests as members
        member_count = db.query(ClubJoinRequest).filter(
            ClubJoinRequest.club_id == club.id,
            ClubJoinRequest.status == JoinRequestStatus.APPROVED
        ).count()

        # Count followers
        follower_count = len(club.followers)

        result.append(ClubResponse(
            id=club.id,
            name=club.name,
            description=club.description,
            contact_email=club.contact_email,
            manager_id=club.manager_id,
            advisor_id=club.advisor_id,
            created_at=club.created_at,
            member_count=member_count,
            follower_count=follower_count
        ))

    return result


@router.get("/{club_id}/members")
async def get_club_members(
    club_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get approved members of a club

    Args:
        club_id: Club ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of approved members with their join request info

    Raises:
        HTTPException: If club not found
    """
    from app.models import ClubJoinRequest, JoinRequestStatus
    from app.schemas import UserResponse

    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    # Get approved join requests
    approved_requests = db.query(ClubJoinRequest).filter(
        ClubJoinRequest.club_id == club_id,
        ClubJoinRequest.status == JoinRequestStatus.APPROVED
    ).all()

    members = []
    for req in approved_requests:
        members.append({
            "id": req.user.id,
            "full_name": req.user.full_name,
            "email": req.user.email,
            "student_number": req.user.student_number,
            "department": req.user.department,
            "joined_at": req.reviewed_at,
            "join_request_id": req.id
        })

    return members


@router.delete("/{club_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_club_member(
    club_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Remove a member from a club (manager/advisor only)

    Args:
        club_id: Club ID
        user_id: User ID to remove
        db: Database session
        current_user: Current authenticated user

    Raises:
        HTTPException: If club not found, user not authorized, or member not found
    """
    from app.models import ClubJoinRequest, JoinRequestStatus

    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    # Check if current user is manager or advisor of this club
    if current_user.role not in [UserRole.ADMIN] and club.manager_id != current_user.id and club.advisor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to manage this club"
        )

    # Find the approved join request
    join_request = db.query(ClubJoinRequest).filter(
        ClubJoinRequest.club_id == club_id,
        ClubJoinRequest.user_id == user_id,
        ClubJoinRequest.status == JoinRequestStatus.APPROVED
    ).first()

    if not join_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in this club"
        )

    # Delete the join request (removes membership)
    db.delete(join_request)
    db.commit()
