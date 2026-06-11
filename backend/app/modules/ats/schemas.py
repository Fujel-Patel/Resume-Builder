"""
Pydantic schemas for the ATS module.
These schemas align with the PRD JSON response format.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class ATSScoreRequest(BaseModel):
    """Request payload for scoring a resume.
    `resume_text` can be extracted from an uploaded PDF or provided directly.
    """

    resume_text: str = Field(..., description="Raw resume text to be scored")
    job_description: Optional[str] = Field(
        None, description="Target job description (optional)"
    )

    model_config = ConfigDict(str_strip_whitespace=True)


class ATSScoreResponse(BaseModel):
    """Response format for a single ATS score report (matches PRD)."""

    overall_score: int = Field(..., ge=0, le=100)
    section_scores: Dict[str, int] = Field(
        ...,
        description="Scores for each section: format, keywords, readability, completeness",
    )
    missing_keywords: List[str] = Field(
        ..., description="Keywords that were missing in the resume"
    )
    suggestions: List[str] = Field(..., description="Improvement suggestions")
    # Include the raw score report as a dict for flexibility
    raw_report: Dict[str, Any] = Field(..., alias="score_report")

    model_config = ConfigDict(from_attributes=True)


class ATSScanBase(BaseModel):
    job_description: Optional[str] = None
    overall_score: int
    score_report: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ATSScanCreate(BaseModel):
    # Used internally when creating a new scan record
    job_description: Optional[str] = None
    resume_text: str
    overall_score: int
    score_report: Dict[str, Any]
    resume_id: Optional[str] = None

    model_config = ConfigDict(str_strip_whitespace=True)


class ATSScanResponse(ATSScanBase):
    id: str
    user_id: str
    resume_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
