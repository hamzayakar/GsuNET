"""
User model for authentication and authorization
"""
from sqlalchemy import Column, Integer, String, Enum as SQLEnum, DateTime, Table, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class UserRole(str, enum.Enum):
    """User role enumeration"""
    STUDENT = "student"
    CLUB_MANAGER = "club_manager"
    ADVISOR = "advisor"
    ADMIN = "admin"
    SPONSOR = "sponsor"  # NEW - Review6: Sponsorship matching system


# Association table for user-club many-to-many relationship
user_club_association = Table(
    'user_club_association',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete='CASCADE')),
    Column('club_id', Integer, ForeignKey('clubs.id', ondelete='CASCADE'))
)


class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    student_number = Column(String, unique=True, index=True, nullable=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.STUDENT, nullable=False)
    department = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    followed_clubs = relationship(
        "Club",
        secondary=user_club_association,
        back_populates="followers"
    )
    managed_clubs = relationship("Club", back_populates="manager", foreign_keys="[Club.manager_id]")
    event_registrations = relationship("EventRegistration", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

    def __repr__(self):
        return f"<User {self.email}>"
