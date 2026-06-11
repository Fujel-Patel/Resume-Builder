from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class ATSScanBase(BaseModel):
    job_description: Optional[str] = None
    score_report: Dict[str, Any]
    overall_score: int = Field(..., ge=0, le=100)


class ATSScanCreate(ATSScanBase):
    resume_id: Optional[str] = None


class ATSScanUpdate(BaseModel):
    job_description: Optional[str] = None
    score_report: Optional[Dict[str, Any]] = None
    overall_score: Optional[int] = Field(None, ge=0, le=100)


class ATSScanInDBBase(ATSScanBase):
    id: str
    user_id: str
    resume_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ATSScanInDB(ATSScanInDBBase):
    pass


class ATSScanResponse(ATSScanInDBBase):
    pass


class ATSScoreRequest(BaseModel):
    resume_text: str
    job_description: Optional[str] = None


class ATSScoreResponse(BaseModel):
    overall_score: int = Field(..., ge=0, le=100)
    section_scores: Dict[str, int]
    missing_keywords: List[str]
    suggestions: List[str]