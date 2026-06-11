import uuid

from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.config.database import Base
from app.modules.users import (
    models as user_models,  # for relationship typing (optional)
)


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    title = Column(String(255), nullable=True)  # e.g., "Software Engineer Resume"
    data = Column(JSON, nullable=False)  # stores the structured resume (see ResumeData)
    file_url = Column(
        String(1024), nullable=True
    )  # URL to stored PDF (generated or uploaded)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Optional relationship (helps with ORM queries)
    # user = relationship("User", back_populates="resumes")
