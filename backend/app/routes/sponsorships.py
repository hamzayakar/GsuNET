"""
Sponsorship Routes for AI-powered sponsor-club matching
Review6: Sponsor matching feature with TWO-WAY MATCHING

Endpoints:
- POST /apply: Create sponsorship application (sponsor role)
- GET /my-applications: Get my applications (sponsor role)
- GET /all: Get all applications regardless of status (admin role)
- GET /pending: Get pending applications (admin/advisor role)
- PUT /{id}/review: Approve/reject application + trigger AI matching (admin role)
- GET /{id}/matches: Get AI matches for a specific sponsorship (admin role)
- GET /matches/my-club: Get matches for my club (club_manager/advisor role)
- GET /{id}/details: Get sponsorship details (club_manager/advisor/admin role)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.openai_service import OpenAIService
from app.core.redis import get_arq_pool
from app.models.user import User, UserRole
from app.models.club import Club
from app.models.sponsorship_request import SponsorshipRequest, SponsorshipStatus, SponsorshipType
from app.models.sponsorship_match import SponsorshipMatch
from app.schemas.sponsorship_request import (
    SponsorshipRequestCreate,
    SponsorshipRequestResponse,
    SponsorshipReviewRequest,
    SponsorshipMatchResponse,
    SponsorshipDetailsResponse
)


router = APIRouter(prefix="/api/v1/sponsorships", tags=["sponsorships"])


# ============================================
# SPONSOR ENDPOINTS
# ============================================

@router.post("/apply", response_model=SponsorshipRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_sponsorship_application(
    request_data: SponsorshipRequestCreate,
    current_user: User = Depends(require_role([UserRole.SPONSOR])),
    db: Session = Depends(get_db)
):
    """
    Create a new sponsorship application (sponsor role only).

    The application will be in PENDING status until admin reviews it.
    Admin will be notified via notification system.
    """
    # Debug logging
    print(f"[SPONSORSHIP DEBUG] Received application data:")
    print(f"  Company: {request_data.company_name}")
    print(f"  Contact: {request_data.contact_info}")
    print(f"  Vision length: {len(request_data.vision)} chars")
    print(f"  Goals length: {len(request_data.sponsorship_goals)} chars")
    print(f"  Type: {request_data.sponsorship_type}")
    print(f"  Budget: {request_data.budget_range}")

    # Create new sponsorship request
    new_request = SponsorshipRequest(
        sponsor_id=current_user.id,
        company_name=request_data.company_name,
        contact_info=request_data.contact_info,
        vision=request_data.vision,
        sponsorship_goals=request_data.sponsorship_goals,
        sponsorship_type=request_data.sponsorship_type,
        budget_range=request_data.budget_range,
        status=SponsorshipStatus.PENDING
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    # Notify all admins
    admin_users = db.query(User).filter(User.role == UserRole.ADMIN).all()
    arq_pool = await get_arq_pool()

    for admin in admin_users:
        await arq_pool.enqueue_job(
            "send_notification_task",
            admin.id,
            f"Yeni sponsorluk başvurusu: {new_request.company_name}",
            "sponsorship_request_created"
        )

    return new_request


@router.get("/my-applications", response_model=List[SponsorshipRequestResponse])
async def get_my_sponsorship_applications(
    current_user: User = Depends(require_role([UserRole.SPONSOR])),
    db: Session = Depends(get_db)
):
    """
    Get all sponsorship applications for the current sponsor user.

    Returns applications ordered by creation date (newest first).
    """
    applications = db.query(SponsorshipRequest).options(
        joinedload(SponsorshipRequest.sponsor)
    ).filter(
        SponsorshipRequest.sponsor_id == current_user.id
    ).order_by(SponsorshipRequest.created_at.desc()).all()

    return applications


# ============================================
# ADMIN/ADVISOR ENDPOINTS
# ============================================

@router.get("/all", response_model=List[SponsorshipRequestResponse])
async def get_all_sponsorship_requests(
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Get all sponsorship requests regardless of status (admin only).

    Returns all requests (PENDING, APPROVED, REJECTED) ordered by creation date (newest first).
    Includes sponsor information (full_name, email) via relationship.
    """
    all_requests = db.query(SponsorshipRequest).options(
        joinedload(SponsorshipRequest.sponsor)
    ).order_by(
        SponsorshipRequest.created_at.desc()
    ).all()

    return all_requests


@router.get("/pending", response_model=List[SponsorshipRequestResponse])
async def get_pending_sponsorship_requests(
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.ADVISOR])),
    db: Session = Depends(get_db)
):
    """
    Get all pending sponsorship requests (admin/advisor only).

    Returns only PENDING requests ordered by creation date (oldest first).
    """
    pending_requests = db.query(SponsorshipRequest).options(
        joinedload(SponsorshipRequest.sponsor)
    ).filter(
        SponsorshipRequest.status == SponsorshipStatus.PENDING
    ).order_by(SponsorshipRequest.created_at.asc()).all()

    return pending_requests


@router.put("/{request_id}/review", response_model=SponsorshipRequestResponse)
async def review_sponsorship_request(
    request_id: int,
    review_data: SponsorshipReviewRequest,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Review (approve/reject) a sponsorship request (admin only).

    If APPROVED:
    - Triggers AI-powered club matching via ChatGPT
    - Creates SponsorshipMatch entries for top 3-5 clubs
    - Notifies matched clubs' managers and advisors

    If REJECTED:
    - Rejection reason can be provided
    - Notifies sponsor
    """
    # Find the sponsorship request
    sponsorship_req = db.query(SponsorshipRequest).filter(
        SponsorshipRequest.id == request_id
    ).first()

    if not sponsorship_req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsorship request not found"
        )

    # Check if already reviewed
    if sponsorship_req.status != SponsorshipStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Sponsorship request already {sponsorship_req.status.value}"
        )

    # Update status
    sponsorship_req.status = review_data.status
    sponsorship_req.rejection_reason = review_data.rejection_reason
    sponsorship_req.approved_by_id = current_user.id
    sponsorship_req.approved_at = datetime.now(timezone.utc)

    db.commit()

    # If approved, trigger AI matching
    if review_data.status == SponsorshipStatus.APPROVED:
        try:
            # Initialize OpenAI service
            openai_service = OpenAIService()

            # Prepare sponsor data for matching
            sponsor_data = {
                "company_name": sponsorship_req.company_name,
                "sponsorship_type": sponsorship_req.sponsorship_type.value,
                "vision": sponsorship_req.vision,
                "sponsorship_goals": sponsorship_req.sponsorship_goals,
                "budget_range": sponsorship_req.budget_range,
                "contact_info": sponsorship_req.contact_info
            }

            # Call AI matching service (TWO-WAY MATCHING)
            matches = await openai_service.match_sponsor_with_clubs(sponsor_data, db, top_n=3)

            # Create match entries in database
            for match in matches:
                new_match = SponsorshipMatch(
                    sponsorship_request_id=sponsorship_req.id,
                    club_id=match["club_id"],
                    match_rank=match["rank"],
                    ai_reasoning=match["reasoning"]
                )
                db.add(new_match)

            db.commit()

            # Notify matched clubs' managers and advisors
            arq_pool = await get_arq_pool()

            for match in matches:
                club = db.query(Club).filter(Club.id == match["club_id"]).first()
                if club:
                    # Notify club manager
                    if club.manager_id:
                        await arq_pool.enqueue_job(
                            "send_notification_task",
                            club.manager_id,
                            f"🎉 Sponsorluk eşleşmesi: {sponsorship_req.company_name} kulübünüzle eşleşti!",
                            "sponsorship_match_created"
                        )

                    # Notify club advisor
                    if club.advisor_id:
                        await arq_pool.enqueue_job(
                            "send_notification_task",
                            club.advisor_id,
                            f"📊 {club.name} için sponsorluk eşleşmesi: {sponsorship_req.company_name}",
                            "sponsorship_match_created"
                        )

        except Exception as e:
            # Log error but don't fail the approval
            print(f"AI Matching Error: {e}")
            # Continue with approval even if AI matching fails

    # Notify sponsor about the decision
    arq_pool = await get_arq_pool()
    if review_data.status == SponsorshipStatus.APPROVED:
        notification_message = "✅ Sponsorluk başvurunuz onaylandı! Kulüp eşleşmeleri oluşturuldu."
    else:
        notification_message = f"❌ Sponsorluk başvurunuz reddedildi. Sebep: {review_data.rejection_reason or 'Belirtilmemiş'}"

    await arq_pool.enqueue_job(
        "send_notification_task",
        sponsorship_req.sponsor_id,
        notification_message,
        "sponsorship_request_reviewed"
    )

    db.refresh(sponsorship_req)
    return sponsorship_req


# ============================================
# CLUB MANAGER/ADVISOR ENDPOINTS
# ============================================

@router.get("/matches/my-club", response_model=List[SponsorshipMatchResponse])
async def get_my_club_sponsorship_matches(
    current_user: User = Depends(require_role([UserRole.CLUB_MANAGER, UserRole.ADVISOR])),
    db: Session = Depends(get_db)
):
    """
    Get all sponsorship matches for the current user's club(s).

    Returns matches for:
    - Club manager: clubs they manage
    - Advisor: clubs they advise

    Ordered by match rank (1 = best match).
    """
    # Find user's clubs
    if current_user.role == UserRole.CLUB_MANAGER:
        clubs = db.query(Club).filter(Club.manager_id == current_user.id).all()
    elif current_user.role == UserRole.ADVISOR:
        clubs = db.query(Club).filter(Club.advisor_id == current_user.id).all()
    else:
        clubs = []

    if not clubs:
        return []

    club_ids = [club.id for club in clubs]

    # Find all matches for these clubs
    matches = db.query(SponsorshipMatch).filter(
        SponsorshipMatch.club_id.in_(club_ids)
    ).order_by(SponsorshipMatch.match_rank.asc()).all()

    # Build response with club names
    results = []
    for match in matches:
        club = db.query(Club).filter(Club.id == match.club_id).first()
        results.append(SponsorshipMatchResponse(
            id=match.id,
            sponsorship_request_id=match.sponsorship_request_id,
            club_id=match.club_id,
            club_name=club.name if club else "Unknown",
            match_rank=match.match_rank,
            ai_reasoning=match.ai_reasoning,
            created_at=match.created_at
        ))

    return results


@router.get("/{request_id}/matches", response_model=List[SponsorshipMatchResponse])
async def get_sponsorship_matches(
    request_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Get all AI-generated matches for a specific sponsorship request (admin only).

    Returns matches ordered by rank (1 = best match).
    Includes club information and AI reasoning for each match.
    """
    # Verify sponsorship exists
    sponsorship_req = db.query(SponsorshipRequest).filter(
        SponsorshipRequest.id == request_id
    ).first()

    if not sponsorship_req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsorship request not found"
        )

    # Get all matches for this sponsorship with club and manager info
    matches = db.query(SponsorshipMatch).options(
        joinedload(SponsorshipMatch.club).joinedload(Club.manager)
    ).filter(
        SponsorshipMatch.sponsorship_request_id == request_id
    ).order_by(SponsorshipMatch.match_rank.asc()).all()

    # Build response - relationships are already loaded
    results = []
    for match in matches:
        results.append(SponsorshipMatchResponse(
            id=match.id,
            sponsorship_request_id=match.sponsorship_request_id,
            club_id=match.club_id,
            club_name=match.club.name if match.club else "Unknown",
            club=match.club,  # Include full club object
            match_rank=match.match_rank,
            ai_reasoning=match.ai_reasoning,
            created_at=match.created_at
        ))

    return results


@router.get("/{request_id}/details", response_model=SponsorshipDetailsResponse)
async def get_sponsorship_details(
    request_id: int,
    current_user: User = Depends(require_role([UserRole.CLUB_MANAGER, UserRole.ADVISOR, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a sponsorship request.

    Accessible by:
    - Admin: all sponsorships
    - Club manager/advisor: only if their club has a match

    Returns sponsorship details WITHOUT sensitive approval information.
    """
    sponsorship_req = db.query(SponsorshipRequest).filter(
        SponsorshipRequest.id == request_id
    ).first()

    if not sponsorship_req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsorship request not found"
        )

    # Authorization check for non-admins
    if current_user.role != UserRole.ADMIN:
        # Check if user's club has a match with this sponsorship
        user_clubs = []
        if current_user.role == UserRole.CLUB_MANAGER:
            user_clubs = db.query(Club).filter(Club.manager_id == current_user.id).all()
        elif current_user.role == UserRole.ADVISOR:
            user_clubs = db.query(Club).filter(Club.advisor_id == current_user.id).all()

        club_ids = [club.id for club in user_clubs]

        # Check if any match exists
        match_exists = db.query(SponsorshipMatch).filter(
            SponsorshipMatch.sponsorship_request_id == request_id,
            SponsorshipMatch.club_id.in_(club_ids)
        ).first()

        if not match_exists:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view sponsorships matched to your club(s)"
            )

    return SponsorshipDetailsResponse(
        id=sponsorship_req.id,
        company_name=sponsorship_req.company_name,
        contact_info=sponsorship_req.contact_info,
        vision=sponsorship_req.vision,
        sponsorship_goals=sponsorship_req.sponsorship_goals,
        sponsorship_type=sponsorship_req.sponsorship_type,
        budget_range=sponsorship_req.budget_range,
        status=sponsorship_req.status,
        created_at=sponsorship_req.created_at
    )
