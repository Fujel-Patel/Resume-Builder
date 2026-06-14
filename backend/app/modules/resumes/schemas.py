"""Resume Pydantic schemas — strongly typed sections matching PRD."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# Section sub-schemas
# ---------------------------------------------------------------------------

class PersonalInfo(BaseModel):
    first_name: str = ""
    last_name: str = ""
    job_title: str = ""
    email: str = ""
    mobile: str = ""
    address: str = ""
    pincode: str = ""
    github: str = ""
    linkedin: str = ""
    portfolio: str = ""


class ExperienceItem(BaseModel):
    company: str = ""
    role: str = ""
    duration: str = ""
    bullets: List[str] = Field(default_factory=list)


class ProjectItem(BaseModel):
    name: str = ""
    description: str = ""
    live_link: str = ""
    tech_stack: List[str] = Field(default_factory=list)


class EducationItem(BaseModel):
    institution: str = ""
    degree: str = ""
    year: str = ""
    grade: str = ""


class CertificationItem(BaseModel):
    name: str = ""
    issuer: str = ""
    year: str = ""
    link: str = ""


class CustomSection(BaseModel):
    label: str = ""
    content: str = ""


class ResumeContent(BaseModel):
    """Matches resume_data table columns."""
    personal: Optional[PersonalInfo] = None
    summary: Optional[str] = None
    skills: Optional[List[str]] = None
    experience: Optional[List[ExperienceItem]] = None
    projects: Optional[List[ProjectItem]] = None
    education: Optional[List[EducationItem]] = None
    certifications: Optional[List[CertificationItem]] = None
    custom_sections: Optional[List[CustomSection]] = None


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

TEMPLATE_IDS = {"classic", "modern", "minimal", "creative"}


class ResumeCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    template_id: str = Field(..., description="classic | modern | minimal | creative")
    content: Optional[ResumeContent] = None

    model_config = ConfigDict(str_strip_whitespace=True)

    def model_post_init(self, __context: Any) -> None:
        if self.template_id not in TEMPLATE_IDS:
            raise ValueError(f"template_id must be one of {TEMPLATE_IDS}")


class ResumeUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    template_id: Optional[str] = None
    content: Optional[ResumeContent] = None

    model_config = ConfigDict(str_strip_whitespace=True)


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class ResumeDataResponse(BaseModel):
    id: UUID
    resume_id: UUID
    personal: Optional[Dict] = None
    summary: Optional[str] = None
    skills: Optional[List[str]] = None
    experience: Optional[List[Dict]] = None
    projects: Optional[List[Dict]] = None
    education: Optional[List[Dict]] = None
    certifications: Optional[List[Dict]] = None
    custom_sections: Optional[List[Dict]] = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResumeResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    template_id: str
    is_deleted: bool
    created_at: datetime
    updated_at: datetime
    data: Optional[ResumeDataResponse] = None

    model_config = ConfigDict(from_attributes=True)
