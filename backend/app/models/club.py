"""
Club model for student organizations
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from app.models.user import user_club_association


class Club(Base):
    """Club/Organization model"""
    __tablename__ = "clubs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)

    # Foreign keys
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    advisor_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    manager = relationship("User", back_populates="managed_clubs", foreign_keys=[manager_id])
    advisor = relationship("User", foreign_keys=[advisor_id])
    followers = relationship(
        "User",
        secondary=user_club_association,
        back_populates="followed_clubs"
    )
    events = relationship("Event", back_populates="club")
    sponsorships = relationship("Sponsorship", back_populates="club")

    def __repr__(self):
        return f"<Club {self.name}>"
