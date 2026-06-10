from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.config.database import Base


class AIProvider(Base):
    __tablename__ = "ai_providers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    provider_name = Column(String(100), nullable=False)  # anthropic | gemini | nvidia-nim | custom
    api_key_encrypted = Column(String(500), nullable=False)  # AES-256-GCM encrypted
    base_url = Column(String(500), nullable=True)  # for custom/nvidia providers
    is_default = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Ensure user can only have one default provider per provider_name
    __table_args__ = (
        {'postgresql_concurrently': False},
    )