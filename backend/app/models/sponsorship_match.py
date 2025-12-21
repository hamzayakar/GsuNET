"""
Sponsorship Match model for AI-powered sponsor-club matching results
Review6: Sponsor matching feature - stores ChatGPT matching results
"""
from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime, Index, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class SponsorshipMatch(Base):
    """Sponsorship Match model - stores AI matching results"""
    __tablename__ = "sponsorship_matches"

    id = Column(Integer, primary_key=True, index=True)

    # Match details
    sponsorship_request_id = Column(Integer, ForeignKey("sponsorship_requests.id", ondelete="CASCADE"), nullable=False)
    club_id = Column(Integer, ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False)
    match_rank = Column(Integer, nullable=False)  # 1-5 ranking from ChatGPT
    ai_reasoning = Column(Text, nullable=False)  # ChatGPT's explanation for the match

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    sponsorship_request = relationship("SponsorshipRequest", back_populates="matches")
    club = relationship("Club")

    # Constraints
    __table_args__ = (
        CheckConstraint("match_rank >= 1 AND match_rank <= 5", name="check_match_rank_range"),
        UniqueConstraint("sponsorship_request_id", "club_id", name="uq_sponsorship_club"),
        Index("idx_match_request", "sponsorship_request_id"),
        Index("idx_match_club", "club_id"),
    )

    def __repr__(self):
        return f"<SponsorshipMatch Rank {self.match_rank} - Request {self.sponsorship_request_id} - Club {self.club_id}>"
