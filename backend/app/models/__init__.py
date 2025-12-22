"""
Models package initialization
Export all models for easy imports
"""
from app.models.user import User, UserRole
from app.models.club import Club
from app.models.event import Event, EventStatus
from app.models.room import Room
from app.models.room_schedule import RoomSchedule, BlockType
from app.models.sponsorship import Sponsorship, SponsorshipStatus
from app.models.sponsorship_request import SponsorshipRequest, SponsorshipType  # Review6
from app.models.sponsorship_match import SponsorshipMatch  # Review6
from app.models.event_registration import EventRegistration
from app.models.notification import Notification, NotificationType
from app.models.club_join_request import ClubJoinRequest, JoinRequestStatus

__all__ = [
    "User",
    "UserRole",
    "Club",
    "Event",
    "EventStatus",
    "Room",
    "RoomSchedule",
    "BlockType",
    "Sponsorship",
    "SponsorshipStatus",
    "SponsorshipRequest",  # Review6
    "SponsorshipType",  # Review6
    "SponsorshipMatch",  # Review6
    "EventRegistration",
    "Notification",
    "NotificationType",
    "ClubJoinRequest",
    "JoinRequestStatus",
]
