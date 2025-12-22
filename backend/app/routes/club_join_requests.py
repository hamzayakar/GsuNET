"""
Club join request management routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, require_role
from app.models import ClubJoinRequest, User, Club, UserRole, JoinRequestStatus, Notification, NotificationType
from app.schemas import ClubJoinRequestCreate, ClubJoinRequestReview, ClubJoinRequestResponse

router = APIRouter(prefix="/club-join-requests", tags=["Club Join Requests"])


@router.post("/", response_model=ClubJoinRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_join_request(
    request_data: ClubJoinRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a club join request (students only)

    Args:
        request_data: Join request data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Created join request object

    Raises:
        HTTPException: If club not found or request already exists
    """
    # Check if club exists
    club = db.query(Club).filter(Club.id == request_data.club_id).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    # Check if user is manager or advisor of this club
    if club.manager_id == current_user.id or club.advisor_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot request to join a club you manage or advise"
        )

    # Check if user is already a member (approved request)
    existing_member = db.query(ClubJoinRequest).filter(
        ClubJoinRequest.user_id == current_user.id,
        ClubJoinRequest.club_id == request_data.club_id,
        ClubJoinRequest.status == JoinRequestStatus.APPROVED
    ).first()

    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already a member of this club"
        )

    # Check if user already has a pending request for this club
    existing_request = db.query(ClubJoinRequest).filter(
        ClubJoinRequest.user_id == current_user.id,
        ClubJoinRequest.club_id == request_data.club_id,
        ClubJoinRequest.status == JoinRequestStatus.PENDING
    ).first()

    if existing_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a pending request for this club"
        )

    # Create join request
    join_request = ClubJoinRequest(
        user_id=current_user.id,
        club_id=request_data.club_id,
        message=request_data.message,
        status=JoinRequestStatus.PENDING
    )

    db.add(join_request)
    db.commit()
    db.refresh(join_request)

    # Create notification for club manager and advisor
    notified_users = []
    if club.manager_id:
        notified_users.append(club.manager_id)
    if club.advisor_id and club.advisor_id not in notified_users:
        notified_users.append(club.advisor_id)

    for user_id in notified_users:
        notification = Notification(
            title=f"New Join Request for {club.name}",
            message=f"{current_user.full_name} has requested to join {club.name}. Review the request in the club management panel.",
            notification_type=NotificationType.CLUB_UPDATE,
            user_id=user_id,
            read=False
        )
        db.add(notification)

    db.commit()
    db.refresh(join_request)

    return ClubJoinRequestResponse(
        id=join_request.id,
        user_id=join_request.user_id,
        club_id=join_request.club_id,
        message=join_request.message,
        status=join_request.status,
        rejection_reason=join_request.rejection_reason,
        requested_at=join_request.requested_at,
        reviewed_at=join_request.reviewed_at,
        reviewed_by_id=join_request.reviewed_by_id,
        user={"id": current_user.id, "full_name": current_user.full_name, "email": current_user.email},
        club={"id": club.id, "name": club.name}
    )


@router.get("/my-requests", response_model=List[ClubJoinRequestResponse])
async def get_my_join_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user's join requests

    Args:
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of user's join requests
    """
    requests = db.query(ClubJoinRequest).filter(
        ClubJoinRequest.user_id == current_user.id
    ).order_by(ClubJoinRequest.requested_at.desc()).all()

    response_data = []
    for req in requests:
        response_data.append(ClubJoinRequestResponse(
            id=req.id,
            user_id=req.user_id,
            club_id=req.club_id,
            message=req.message,
            status=req.status,
            rejection_reason=req.rejection_reason,
            requested_at=req.requested_at,
            reviewed_at=req.reviewed_at,
            reviewed_by_id=req.reviewed_by_id,
            user={"id": req.user.id, "full_name": req.user.full_name, "email": req.user.email},
            club={"id": req.club.id, "name": req.club.name}
        ))

    return response_data


@router.get("/club/{club_id}", response_model=List[ClubJoinRequestResponse])
async def get_club_join_requests(
    club_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get join requests for a specific club (club managers only)

    Args:
        club_id: Club ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of join requests for the club

    Raises:
        HTTPException: If not authorized or club not found
    """
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    # Check authorization: only club managers and advisors can view requests
    is_manager = any(c.id == club_id for c in current_user.managed_clubs)
    is_advisor = club.advisor_id == current_user.id
    if not is_manager and not is_advisor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view join requests for this club"
        )

    requests = db.query(ClubJoinRequest).filter(
        ClubJoinRequest.club_id == club_id
    ).order_by(ClubJoinRequest.requested_at.desc()).all()

    response_data = []
    for req in requests:
        response_data.append(ClubJoinRequestResponse(
            id=req.id,
            user_id=req.user_id,
            club_id=req.club_id,
            message=req.message,
            status=req.status,
            rejection_reason=req.rejection_reason,
            requested_at=req.requested_at,
            reviewed_at=req.reviewed_at,
            reviewed_by_id=req.reviewed_by_id,
            user={"id": req.user.id, "full_name": req.user.full_name, "email": req.user.email},
            club={"id": req.club.id, "name": req.club.name}
        ))

    return response_data


@router.put("/{request_id}/review", response_model=ClubJoinRequestResponse)
async def review_join_request(
    request_id: int,
    review_data: ClubJoinRequestReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Approve or reject a join request (club managers only)

    Args:
        request_id: Join request ID
        review_data: Review decision
        db: Database session
        current_user: Current authenticated user

    Returns:
        Updated join request object

    Raises:
        HTTPException: If not authorized or request not found
    """
    join_request = db.query(ClubJoinRequest).filter(
        ClubJoinRequest.id == request_id
    ).first()

    if not join_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Join request not found"
        )

    # Check authorization: only club managers and advisors can review
    is_manager = any(c.id == join_request.club_id for c in current_user.managed_clubs)
    club = db.query(Club).filter(Club.id == join_request.club_id).first()
    is_advisor = club and club.advisor_id == current_user.id
    if not is_manager and not is_advisor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to review this join request"
        )

    # Update request status
    join_request.status = review_data.status
    join_request.reviewed_at = datetime.now(timezone.utc)
    join_request.reviewed_by_id = current_user.id

    if review_data.rejection_reason:
        join_request.rejection_reason = review_data.rejection_reason

    # Note: Member status is tracked via ClubJoinRequest.status (APPROVED)
    # No need to maintain a separate members relationship

    db.commit()
    db.refresh(join_request)

    # Create notification for user
    club = db.query(Club).filter(Club.id == join_request.club_id).first()
    status_text = "approved" if review_data.status == JoinRequestStatus.APPROVED else "rejected"
    notification = Notification(
        title=f"Join Request {status_text.capitalize()}",
        message=f"Your request to join {club.name} has been {status_text}.{' Reason: ' + review_data.rejection_reason if review_data.rejection_reason else ''}",
        notification_type=NotificationType.CLUB_UPDATE,
        user_id=join_request.user_id,
        read=False
    )
    db.add(notification)
    db.commit()

    return ClubJoinRequestResponse(
        id=join_request.id,
        user_id=join_request.user_id,
        club_id=join_request.club_id,
        message=join_request.message,
        status=join_request.status,
        rejection_reason=join_request.rejection_reason,
        requested_at=join_request.requested_at,
        reviewed_at=join_request.reviewed_at,
        reviewed_by_id=join_request.reviewed_by_id,
        user={"id": join_request.user.id, "full_name": join_request.user.full_name, "email": join_request.user.email},
        club={"id": club.id, "name": club.name}
    )


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_join_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Cancel a pending join request

    Args:
        request_id: Join request ID
        db: Database session
        current_user: Current authenticated user

    Raises:
        HTTPException: If not authorized or request not found
    """
    join_request = db.query(ClubJoinRequest).filter(
        ClubJoinRequest.id == request_id
    ).first()

    if not join_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Join request not found"
        )

    # Authorization: only the requester can cancel
    if join_request.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to cancel this request"
        )

    # Only pending requests can be cancelled
    if join_request.status != JoinRequestStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending requests can be cancelled"
        )

    db.delete(join_request)
    db.commit()
