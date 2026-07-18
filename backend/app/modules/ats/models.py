"""
SQLAlchemy model for ATS scan results.
Matches the PRD schema (section 5.4) and stores the AI-generated score report as JSONB.
"""

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.sql import func

from app.config.database import Base


class ATSScan(Base):
    __tablename__ = "ats_scans"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    resume_id = Column(PG_UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True, index=True)
    job_description = Column(Text, nullable=True)
    # Store the full AI report as JSONB for easy querying
    score_report = Column(JSONB, nullable=False)
    overall_score = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = ()
