"""AI router — PRD response shape, no raw returns."""

import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.modules.ai import prompts, schemas as ai_schemas, service as ai_service
from app.modules.users import models as user_models
from app.types.common import success
from app.utils.auth import get_current_user

router = APIRouter()


def _ai_error(msg: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail={"code": "AI_PROVIDER_ERROR", "message": msg},
    )


# ---------------------------------------------------------------------------
# POST /ai/suggest/summary
# ---------------------------------------------------------------------------

@router.post("/suggest/summary")
async def suggest_summary(
    req: ai_schemas.SummaryRequest,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    prompt = (
        f"{prompts.SUMMARY_PROMPT}\n"
        f"Job Title: {req.job_title}\n"
        f"Skills: {', '.join(req.skills)}\n"
        f"Experience: {', '.join(req.experience)}\n"
        f"Job Description: {req.job_description}\n"
    )
    try:
        result = await ai_service.ai_complete(str(current_user.id), prompt, db)
    except Exception as e:
        raise _ai_error(str(e))
    return success({"summary": result})


# ---------------------------------------------------------------------------
# POST /ai/suggest/skills
# ---------------------------------------------------------------------------

@router.post("/suggest/skills")
async def suggest_skills(
    req: ai_schemas.SkillsRequest,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    prompt = (
        f"{prompts.SKILLS_PROMPT}\n"
        f"Job Description: {req.job_description}\n"
        f"Current Skills: {', '.join(req.current_skills)}\n"
    )
    try:
        raw = await ai_service.ai_complete(str(current_user.id), prompt, db)
        skills = json.loads(raw)
    except json.JSONDecodeError:
        raise _ai_error("AI returned invalid JSON for skills list")
    except Exception as e:
        raise _ai_error(str(e))
    return success({"skills": skills})


# ---------------------------------------------------------------------------
# POST /ai/suggest/experience
# ---------------------------------------------------------------------------

@router.post("/suggest/experience")
async def improve_experience(
    req: ai_schemas.ExperienceRequest,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    jd_line = f"Job Description: {req.job_description}\n" if req.job_description else ""
    prompt = (
        f"{prompts.EXPERIENCE_PROMPT}\n"
        f"Job Role: {req.job_role}\n"
        f"{jd_line}"
        f"Bullets: {json.dumps(req.experience_bullets)}\n"
    )
    try:
        raw = await ai_service.ai_complete(str(current_user.id), prompt, db)
        bullets = json.loads(raw)
    except json.JSONDecodeError:
        raise _ai_error("AI returned invalid JSON for experience bullets")
    except Exception as e:
        raise _ai_error(str(e))
    return success({"bullets": bullets})


# ---------------------------------------------------------------------------
# POST /ai/suggest/projects
# ---------------------------------------------------------------------------

@router.post("/suggest/projects")
async def improve_projects(
    req: ai_schemas.ProjectsRequest,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    jd_line = f"Job Description: {req.job_description}\n" if req.job_description else ""
    prompt = (
        f"{prompts.EXPERIENCE_PROMPT}\n"
        f"{jd_line}"
        f"Project Descriptions: {json.dumps(req.project_descriptions)}\n"
    )
    try:
        raw = await ai_service.ai_complete(str(current_user.id), prompt, db)
        improved = json.loads(raw)
    except json.JSONDecodeError:
        raise _ai_error("AI returned invalid JSON for project descriptions")
    except Exception as e:
        raise _ai_error(str(e))
    return success({"projects": improved})


# ---------------------------------------------------------------------------
# POST /ai/generate-resume
# ---------------------------------------------------------------------------

@router.post("/generate-resume")
async def generate_resume(
    req: ai_schemas.GenerateResumeRequest,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    prompt = (
        "You are an AI resume generator. Given the job description and existing resume data, "
        "generate a tailored resume. Return ONLY valid JSON matching the ResumeContent schema.\n"
        f"Job Description: {req.job_description}\n"
        f"Existing Data: {json.dumps(req.existing_data)}\n"
    )
    try:
        raw = await ai_service.ai_complete(str(current_user.id), prompt, db)
        generated = json.loads(raw)
    except json.JSONDecodeError:
        raise _ai_error("AI returned invalid JSON for resume generation")
    except Exception as e:
        raise _ai_error(str(e))
    return success({"resume": generated})
