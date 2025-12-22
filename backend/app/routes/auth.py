"""
Authentication routes for user registration and login
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.models import User, Notification, NotificationType
from app.schemas import UserCreate, UserResponse, UserLogin, Token
from app.schemas.password_reset import PasswordResetRequest, PasswordReset
from app.core.dependencies import get_current_user
import secrets

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user

    Args:
        user_data: User registration data
        db: Database session

    Returns:
        Created user object

    Raises:
        HTTPException: If email already exists
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Check if student number already exists (if provided)
    if user_data.student_number:
        existing_student = db.query(User).filter(
            User.student_number == user_data.student_number
        ).first()
        if existing_student:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student number already registered"
            )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        student_number=user_data.student_number,
        department=user_data.department,
        password_hash=hashed_password,
        role=user_data.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create welcome notification
    welcome_notification = Notification(
        user_id=new_user.id,
        title="Welcome to GSUNET!",
        message=f"Hello {new_user.full_name}! Welcome to GSUNET - Galatasaray University Network. Explore campus events, join clubs, and stay connected with your university community.",
        type=NotificationType.INFO
    )
    db.add(welcome_notification)
    db.commit()

    return new_user


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login user and return JWT access token

    Args:
        form_data: OAuth2 form with username (email) and password
        db: Database session

    Returns:
        Access token

    Raises:
        HTTPException: If credentials are invalid
    """
    # Get user by email
    user = db.query(User).filter(User.email == form_data.username).first()

    # Verify user and password
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user.email,
            "user_id": user.id,
            "role": user.role
        },
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current logged-in user information

    Args:
        current_user: Current authenticated user

    Returns:
        User information
    """
    return current_user


# Simple in-memory storage for reset tokens (in production, use Redis or database)
password_reset_tokens = {}


@router.post("/forgot-password")
async def request_password_reset(
    request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """
    Request password reset - generates token and logs it (demo mode)

    In production, this would send an email with the reset link
    """
    # Check if user exists
    user = db.query(User).filter(User.email == request.email).first()

    if not user:
        # Don't reveal if email exists for security
        return {"message": "If the email exists, a reset link has been sent"}

    # Generate secure random token
    token = secrets.token_urlsafe(32)

    # Store token with user email (expires in 1 hour in production)
    password_reset_tokens[token] = user.email

    # In production, send email here
    # For demo, log the token
    print(f"\n{'='*60}")
    print(f"PASSWORD RESET TOKEN for {user.email}")
    print(f"Token: {token}")
    print(f"Reset URL: http://localhost:5173/reset-password?token={token}")
    print(f"{'='*60}\n")

    return {"message": "If the email exists, a reset link has been sent"}


@router.post("/reset-password")
async def reset_password(
    reset_data: PasswordReset,
    db: Session = Depends(get_db)
):
    """
    Reset password using token
    """
    # Verify token exists
    email = password_reset_tokens.get(reset_data.token)

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    # Get user
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Update password
    user.password_hash = get_password_hash(reset_data.new_password)
    db.commit()

    # Remove used token
    del password_reset_tokens[reset_data.token]

    return {"message": "Password reset successful"}
