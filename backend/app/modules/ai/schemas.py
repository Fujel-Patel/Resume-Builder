"""
Pydantic schemas for the AI module.
These schemas validate the request bodies for the AI suggestion endpoints.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


# Common response schema – matches the API response shape in the PRD
class AIResponse(BaseModel):
    success: bool = True
    data: Dict[str, Any]

    model_config = ConfigDict(from_attributes=True)


# --- Request schemas for each AI endpoint ---


class SummaryRequest(BaseModel):
    job_title: str
    skills: List[str]
    experience: List[str]
    job_description: str
    current_summary: Optional[str] = None

    model_config = ConfigDict(str_strip_whitespace=True)


class SkillsRequest(BaseModel):
    job_description: str
    current_skills: Dict[str, List[str]]

    model_config = ConfigDict(str_strip_whitespace=True)


class ExperienceRequest(BaseModel):
    experience_bullets: List[str]
    job_role: str
    company: Optional[str] = None
    duration: Optional[str] = None
    job_description: Optional[str] = None

    model_config = ConfigDict(str_strip_whitespace=True)


class ProjectsRequest(BaseModel):
    project_descriptions: List[str]
    project_name: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    job_description: Optional[str] = None

    model_config = ConfigDict(str_strip_whitespace=True)


class GenerateResumeRequest(BaseModel):
    job_description: str
    existing_data: Dict[str, Any]  # raw resume JSON data structure

    model_config = ConfigDict(str_strip_whitespace=True)
