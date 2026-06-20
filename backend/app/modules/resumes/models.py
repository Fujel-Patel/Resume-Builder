"""Resume ORM models — matches PRD DB schema exactly (2 tables)."""

import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.config.database import Base


class Resume(Base):
    """Metadata table — title, template, soft-delete state."""
    __tablename__ = "resumes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(255), nullable=False)
    template_id = Column(String(100), nullable=False)  # classic | modern | minimal | creative | default
    original_file_path = Column(String(500), nullable=True)
    original_file_type = Column(String(10), nullable=True)  # "pdf" or "docx"
    injected_file_path = Column(String(500), nullable=True)  # AI-optimized DOCX
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    data = relationship("ResumeData", uselist=False, back_populates="resume", cascade="all, delete-orphan")


class ResumeData(Base):
    """Content table — all sections stored as JSONB for flexible structure."""
    __tablename__ = "resume_data"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(
        UUID(as_uuid=True),
        ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,  # one-to-one
        index=True,
    )
    personal = Column(JSONB, nullable=True)       # {name, email, mobile, address, links, job_title}
    summary = Column(Text, nullable=True)
    skills = Column(JSONB, nullable=True)          # string[]
    skill_groups = Column(JSONB, nullable=True)     # {frontend: [...], backend: [...], ...}
    experience = Column(JSONB, nullable=True)      # [{company, role, duration, bullets}]
    projects = Column(JSONB, nullable=True)        # [{name, description, link, tech_stack}]
    education = Column(JSONB, nullable=True)       # [{institution, degree, year, grade}]
    certifications = Column(JSONB, nullable=True)  # [{name, issuer, year, link}]
    custom_sections = Column(JSONB, nullable=True) # [{label, content}]
    parsed_data = Column(JSONB, nullable=True)     # original AI-parsed content (before optimization)
    template_style = Column(JSONB, nullable=True)  # extracted visual style for "default" template
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    resume = relationship("Resume", back_populates="data")
