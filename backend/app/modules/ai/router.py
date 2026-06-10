from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json

from app.config.database import get_db
from app.modules.ai import service as ai_service
from app.utils.jwt import verify_access_token
from app.modules.users import models as user_models


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> user_models.User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = verify_access_token(token)
        if payload is None:
            raise credentials_exception
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await ai_service.get_user_by_id(db, uuid.UUID(user_id))
    if user is None:
        raise credentials_exception
    return user


# OAuth2 scheme for token extraction
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter()


class SummaryRequest(BaseModel):
    job_title: str
    skills: List[str]
    experience: List[str]
    job_description: Optional[str] = None


class SkillsRequest(BaseModel):
    job_description: str
    current_skills: List[str]


class ExperienceRequest(BaseModel):
    job_role: str
    experience_bullets: List[str]


class ProjectsRequest(BaseModel):
    job_role: str
    project_descriptions: List[str]


class GenerateResumeRequest(BaseModel):
    job_description: str
    existing_resume_data: Optional[Dict[str, Any]] = None


class ATSScoreRequest(BaseModel):
    resume_text: str
    job_description: Optional[str] = None


@router.post("/suggest/summary")
async def suggest_summary(
    request: SummaryRequest,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate or improve professional summary"""
    try:
        # Build prompt using template from PRD
        prompt = ai_service.SUMMARY_PROMPT + "\n\n"
        prompt += f"Job Title: {request.job_title}\n"
        prompt += f"Skills: {', '.join(request.skills)}\n"
        prompt += f"Experience: {', '.join(request.experience)}\n"
        if request.job_description:
            prompt += f"Target Job Description: {request.job_description}\n"
        prompt += "\nProfessional Summary:"

        # Get AI completion
        summary = await ai_service.ai_complete(
            user_id=str(current_user.id),
            prompt=prompt,
            db=db,
            max_tokens=200,
            temperature=0.7
        )

        return {"summary": summary.strip()}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/suggest/skills")
async def suggest_skills(
    request: SkillsRequest,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Suggest skills based on job description"""
    try:
        # Build prompt using template from PRD
        prompt = ai_service.SKILLS_PROMPT + "\n\n"
        prompt += f"Job Description: {request.job_description}\n"
        prompt += f"Current Skills: {', '.join(request.current_skills)}\n"
        prompt += "\nSuggested Skills (JSON array):"

        # Get AI completion
        skills_json = await ai_service.ai_complete(
            user_id=str(current_user.id),
            prompt=prompt,
            db=db,
            max_tokens=200,
            temperature=0.7
        )

        # Parse JSON response
        try:
            skills = json.loads(skills_json.strip())
            if not isinstance(skills, list):
                raise ValueError("Response is not a JSON array")
            return {"skills": skills}
        except json.JSONDecodeError:
            # Fallback: extract array from text
            import re
            match = re.search(r'\[.*\]', skills_json, re.DOTALL)
            if match:
                skills = json.loads(match.group())
                return {"skills": skills}
            else:
                raise ValueError("Could not parse JSON from response")

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/suggest/experience")
async def suggest_experience(
    request: ExperienceRequest,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Improve experience bullet points"""
    try:
        # Build prompt using template from PRD
        prompt = ai_service.EXPERIENCE_PROMPT + "\n\n"
        prompt += f"Job Role: {request.job_role}\n"
        prompt += f"Current Bullets: {json.dumps(request.experience_bullets)}\n"
        prompt += "\nImproved Bullets (JSON array):"

        # Get AI completion
        bullets_json = await ai_service.ai_complete(
            user_id=str(current_user.id),
            prompt=prompt,
            db=db,
            max_tokens=500,
            temperature=0.7
        )

        # Parse JSON response
        try:
            bullets = json.loads(bullets_json.strip())
            if not isinstance(bullets, list):
                raise ValueError("Response is not a JSON array")
            return {"experience_bullets": bullets}
        except json.JSONDecodeError:
            # Fallback: extract array from text
            import re
            match = re.search(r'\[.*\]', bullets_json, re.DOTALL)
            if match:
                bullets = json.loads(match.group())
                return {"experience_bullets": bullets}
            else:
                raise ValueError("Could not parse JSON from response")

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/suggest/projects")
async def suggest_projects(
    request: ProjectsRequest,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Improve project descriptions"""
    try:
        # Build prompt using template from PRD
        prompt = ai_service.PROJECTS_PROMPT + "\n\n"
        prompt += f"Job Role: {request.job_role}\n"
        prompt += f"Current Descriptions: {json.dumps(request.project_descriptions)}\n"
        prompt += "\nImproved Descriptions (JSON array):"

        # Get AI completion
        projects_json = await ai_service.ai_complete(
            user_id=str(current_user.id),
            prompt=prompt,
            db=db,
            max_tokens=500,
            temperature=0.7
        )

        # Parse JSON response
        try:
            projects = json.loads(projects_json.strip())
            if not isinstance(projects, list):
                raise ValueError("Response is not a JSON array")
            return {"project_descriptions": projects}
        except json.JSONDecodeError:
            # Fallback: extract array from text
            import re
            match = re.search(r'\[.*\]', projects_json, re.DOTALL)
            if match:
                projects = json.loads(match.group())
                return {"project_descriptions": projects}
            else:
                raise ValueError("Could not parse JSON from response")

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/generate-resume")
async def generate_resume(
    request: GenerateResumeRequest,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate full resume from job description"""
    try:
        # This would call multiple AI endpoints in parallel
        # For simplicity, we'll return a placeholder
        # In a full implementation, this would:
        # 1. Call suggest_summary
        # 2. Call suggest_skills
        # 3. Call suggest_experience (if existing experience provided)
        # 4. Call suggest_projects (if existing projects provided)
        # 5. Combine results into structured resume data

        return {
            "message": "Full resume generation would be implemented here",
            "job_description": request.job_description,
            "existing_data_provided": request.existing_resume_data is not None
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/ats/score")
async def ats_score(
    request: ATSScoreRequest,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Score resume for ATS compatibility"""
    try:
        # Build prompt using template from PRD
        prompt = ai_service.ATS_SCORE_PROMPT + "\n\n"
        prompt += f"Resume Text: {request.resume_text}\n"
        if request.job_description:
            prompt += f"Job Description: {request.job_description}\n"
        prompt += "\nATS Score (JSON):"

        # Get AI completion
        score_json = await ai_service.ai_complete(
            user_id=str(current_user.id),
            prompt=prompt,
            db=db,
            max_tokens=300,
            temperature=0.3  # Lower temperature for more consistent scoring
        )

        # Parse JSON response
        try:
            score_data = json.loads(score_json.strip())
            # Validate expected structure
            required_keys = ["overall_score", "section_scores", "missing_keywords", "suggestions"]
            for key in required_keys:
                if key not in score_data:
                    raise ValueError(f"Missing required key: {key}")

            if "section_scores" not in score_data:
                raise ValueError("Missing section_scores")

            section_keys = ["format", "keywords", "readability", "completeness"]
            for key in section_keys:
                if key not in score_data["section_scores"]:
                    raise ValueError(f"Missing section score key: {key}")

            return score_data
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON response: {str(e)}")

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )