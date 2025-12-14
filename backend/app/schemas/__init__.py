"""
Schemas package initialization
"""
from app.schemas.user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
    UserLogin,
    Token,
    TokenData,
)
from app.schemas.event import (
    EventBase,
    EventCreate,
    EventUpdate,
    EventResponse,
    EventApproval,
)
from app.schemas.club import (
    ClubBase,
    ClubCreate,
    ClubUpdate,
    ClubResponse,
)
from app.schemas.room import (
    RoomBase,
    RoomCreate,
    RoomUpdate,
    RoomResponse,
    RoomRecommendationQuery,
)
from app.schemas.event_registration import (
    EventRegistrationBase,
    EventRegistrationCreate,
    EventRegistrationResponse,
    EventRegistrationListResponse,
)
from app.schemas.notification import (
    NotificationBase,
    NotificationCreate,
    NotificationUpdate,
    NotificationResponse,
    NotificationMarkAllRead,
)

__all__ = [
    # User schemas
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserLogin",
    "Token",
    "TokenData",
    # Event schemas
    "EventBase",
    "EventCreate",
    "EventUpdate",
    "EventResponse",
    "EventApproval",
    # Club schemas
    "ClubBase",
    "ClubCreate",
    "ClubUpdate",
    "ClubResponse",
    # Room schemas
    "RoomBase",
    "RoomCreate",
    "RoomUpdate",
    "RoomResponse",
    "RoomRecommendationQuery",
    # Event Registration schemas
    "EventRegistrationBase",
    "EventRegistrationCreate",
    "EventRegistrationResponse",
    "EventRegistrationListResponse",
    # Notification schemas
    "NotificationBase",
    "NotificationCreate",
    "NotificationUpdate",
    "NotificationResponse",
    "NotificationMarkAllRead",
]
