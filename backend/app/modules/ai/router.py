"""
AI router – REST endpoints for AI‑assisted resume features.
Endpoints follow the PRD specification (section 7 – AI Endpoints).
"""

import json

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.modules.ai import prompts
from app.modules.ai import schemas as ai_schemas
from app.modules.ai import service as ai_service
from app.modules.users import models as user_models
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/ai",
    tags=["ai"],
    responses={404: {"description": "Not found"}},
)


# ----------------------------------------------------------------------
# Helper to build prompts
# ----------------------------------------------------------------------


def build_summary_prompt(req: ai_schemas.SummaryRequest) -> str:
    return (
        f"{prompts.SUMMARY_PROMPT}\n"
        f"Job Title: {req.job_title}\n"
        f"Skills: {', '.join(req.skills)}\n"
        f"Experience: {', '.join(req.experience)}\n"
        f"Job Description: {req.job_description}\n"
    )


def build_skills_prompt(req: ai_schemas.SkillsRequest) -> str:
    return (
        f"{prompts.SKILLS_PROMPT}\n"
        f"Job Description: {req.job_description}\n"
        f"Current Skills: {', '.join(req.current_skills)}\n"
    )


def build_experience_prompt(req: ai_schemas.ExperienceRequest) -> str:
    role_line = f"Job Role: {req.job_role}\n"
    jd_line = f"Job Description: {req.job_description}\n" if req.job_description else ""
    bullets = ", ".join(req.experience_bullets)
    return (
        f"{prompts.EXPERIENCE_PROMPT}\n"
        f"{role_line}{jd_line}"
        f"Experience Bullets: {bullets}\n"
    )


def build_projects_prompt(req: ai_schemas.ProjectsRequest) -> str:
    jd_line = f"Job Description: {req.job_description}\n" if req.job_description else ""
    descriptions = ", ".join(req.project_descriptions)
    return (
        f"{prompts.EXPERIENCE_PROMPT}\n"  # Reusing experience prompt for simplicity
        f"{jd_line}Project Descriptions: {descriptions}\n"
    )


def build_generate_prompt(req: ai_schemas.GenerateResumeRequest) -> str:
    # For full resume generation we combine the job description with existing data (as JSON string)
    data_json = json.dumps(req.existing_data)
    return (
        f"You are an AI resume generator. Use the following job description and the user's existing resume data to generate a full resume.\n"
        f"Job Description: {req.job_description}\n"
        f"Existing Data: {data_json}\n"
    )


# ----------------------------------------------------------------------
# Endpoints
# ----------------------------------------------------------------------


@router.post("/suggest/summary", response_model=ai_schemas.AIResponse)
async def suggest_summary(
    req: ai_schemas.SummaryRequest,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    prompt = build_summary_prompt(req)
    result = await ai_service.ai_complete(str(current_user.id), prompt, db)
    return ai_schemas.AIResponse(data={"result": result})


@router.post("/suggest/skills", response_model=ai_schemas.AIResponse)
async def suggest_skills(
    req: ai_schemas.SkillsRequest,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    prompt = build_skills_prompt(req)
    result = await ai_service.ai_complete(str(current_user.id), prompt, db)
    return ai_schemas.AIResponse(data={"result": result})


@router.post("/suggest/experience", response_model=ai_schemas.AIResponse)
async def improve_experience(
    req: ai_schemas.ExperienceRequest,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    prompt = build_experience_prompt(req)
    result = await ai_service.ai_complete(str(current_user.id), prompt, db)
    return ai_schemas.AIResponse(data={"result": result})


@router.post("/suggest/projects", response_model=ai_schemas.AIResponse)
async def improve_projects(
    req: ai_schemas.ProjectsRequest,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    prompt = build_projects_prompt(req)
    result = await ai_service.ai_complete(str(current_user.id), prompt, db)
    return ai_schemas.AIResponse(data={"result": result})


@router.post("/generate-resume", response_model=ai_schemas.AIResponse)
async def generate_resume(
    req: ai_schemas.GenerateResumeRequest,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    prompt = build_generate_prompt(req)
    result = await ai_service.ai_complete(str(current_user.id), prompt, db)
    return ai_schemas.AIResponse(data={"result": result})
