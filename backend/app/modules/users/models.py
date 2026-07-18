"""User ORM model."""

import uuid

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.config.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    avatar_url = Column(Text, nullable=True)

    # Account status — 'pending' until email verified
    status = Column(String(20), nullable=False, server_default="active", index=True)
    # Backward-compat flag — kept in sync with status + email_verified
    is_verified = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Email verification fields
    email_verified = Column(Boolean, default=False, nullable=False)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verification_token_hash = Column(String(255), nullable=True, index=True)
    verification_sent_at = Column(DateTime(timezone=True), nullable=True)
    verification_expires_at = Column(DateTime(timezone=True), nullable=True)
    verification_attempts = Column(Integer, default=0, nullable=False)
    last_verification_sent_at = Column(DateTime(timezone=True), nullable=True)
    pending_expires_at = Column(DateTime(timezone=True), nullable=True, index=True)

    # Brute-force protection
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
