"""
SQLAlchemy model for AI provider settings.
Matches the schema defined in the PRD (section 6 – AI provider settings).
"""

import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.config.database import Base


class AIProvider(Base):
    __tablename__ = "ai_providers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    provider_name = Column(
        String(100), nullable=False
    )  # anthropic | gemini | nvidia-nim | custom
    api_key_encrypted = Column(Text, nullable=False)
    base_url = Column(Text, nullable=True)  # for custom/nvidia providers
    is_default = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    model = Column(String(200), nullable=True)  # selected model name e.g. gemini-2.0-flash
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "provider_name", name="uq_user_provider"),
    )
