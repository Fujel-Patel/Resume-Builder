from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
from app.config.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    title = Column(String(255), nullable=False)  # user-defined resume name
    template_id = Column(String(100), nullable=False)  # classic | modern | minimal | creative
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Indexes for performance
    __table_args__ = (
        {'postgresql_concurrently': False},
    )


class ResumeData(Base):
    __tablename__ = "resume_data"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    personal = Column(JSONB, nullable=False)  # name, email, mobile, address, links, job_title
    summary = Column(Text, nullable=True)
    skills = Column(JSONB, nullable=False)  # string[]
    experience = Column(JSONB, nullable=False)  # array of experience objects
    projects = Column(JSONB, nullable=False)  # array of project objects
    education = Column(JSONB, nullable=False)  # array of education objects
    certifications = Column(JSONB, nullable=False)  # array of cert objects
    custom_sections = Column(JSONB, nullable=False)  # array of {label, content}
    updated_at = Column(DateTime(timezone=True), server_default=func.now())

    # Indexes for performance
    __table_args__ = (
        {'postgresql_concurrently': False},
    )