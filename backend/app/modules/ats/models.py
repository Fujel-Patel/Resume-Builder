from sqlalchemy import Column, String, DateTime, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.config.database import Base
from app.modules.resumes import models as resume_models


class ATSScan(Base):
    __tablename__ = "ats_scans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    resume_id = Column(UUID(as_uuid=True), nullable=True)  # Optional reference to resume
    job_description = Column(Text, nullable=True)
    score_report = Column(Text, nullable=False)  # Full AI report JSON
    overall_score = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Indexes for performance
    __table_args__ = (
        {'postgresql_concurrently': False},
    )