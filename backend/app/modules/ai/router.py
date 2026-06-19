"""AI router — PRD response shape, no raw returns."""

import json
import re
import uuid as uuid_lib

import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.config.settings import settings
from app.modules.ai import prompts, schemas as ai_schemas, service as ai_service
from app.modules.resumes import schemas as resume_schemas
from app.modules.resumes import service as resume_service
from app.modules.users import models as user_models
from app.types.common import success
from app.utils.auth import get_current_user
from app.utils.pdf_parser import extract_text, extract_text_from_docx

router = APIRouter()


def _extract_json(text: str) -> dict:
    text = text.strip()
    match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", text, re.DOTALL)
    if match:
        text = match.group(1).strip()
    brace_start = text.find("{")
    if brace_start >= 0:
        depth = 0
        for i in range(brace_start, len(text)):
            if text[i] == "{":
                depth += 1
            elif text[i] == "}":
                depth -= 1
                if depth == 0:
                    text = text[brace_start : i + 1]
                    break
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    try:
        return json.loads(text, strict=False)
    except json.JSONDecodeError:
        pass
    raise json.JSONDecodeError("Could not extract valid JSON from response", text, 0)


def _ai_error(msg: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
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
    parts = [
        prompts.SUMMARY_PROMPT,
        f"Job Title: {req.job_title}",
        f"Skills: {', '.join(req.skills)}",
        f"Experience: {', '.join(req.experience)}",
        f"Job Description: {req.job_description}",
    ]
    if req.current_summary:
        parts.append(f"Current Summary: {req.current_summary}")
    prompt = "\n".join(parts)
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
    skills_text = "\n".join(
        f"  {cat}: {', '.join(items)}" for cat, items in req.current_skills.items()
    )
    prompt = (
        f"{prompts.SKILLS_PROMPT}\n"
        f"Job Description: {req.job_description}\n"
        f"Current Skills:\n{skills_text}\n"
    )
    try:
        raw = await ai_service.ai_complete(str(current_user.id), prompt, db)
        skills = _extract_json(raw)
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
    parts = [
        prompts.EXPERIENCE_PROMPT,
        f"Job Role: {req.job_role}",
    ]
    if req.company:
        parts.append(f"Company: {req.company}")
    if req.duration:
        parts.append(f"Duration: {req.duration}")
    if req.job_description:
        parts.append(f"Job Description: {req.job_description}")
    parts.append(f"Bullets: {json.dumps(req.experience_bullets)}")
    prompt = "\n".join(parts)
    try:
        raw = await ai_service.ai_complete(str(current_user.id), prompt, db)
        bullets = _extract_json(raw)
        if not isinstance(bullets, list):
            bullets = [str(bullets)]
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
    parts = [
        prompts.PROJECTS_PROMPT,
    ]
    if req.project_name:
        parts.append(f"Project Name: {req.project_name}")
    if req.tech_stack:
        parts.append(f"Tech Stack: {', '.join(req.tech_stack)}")
    if req.job_description:
        parts.append(f"Job Description: {req.job_description}")
    parts.append(f"Project Descriptions: {json.dumps(req.project_descriptions)}")
    prompt = "\n".join(parts)
    try:
        raw = await ai_service.ai_complete(str(current_user.id), prompt, db)
        improved = _extract_json(raw)
        if isinstance(improved, dict):
            improved = list(improved.values())[0]
        if not isinstance(improved, list):
            improved = [str(improved)]
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
        generated = _extract_json(raw)
    except json.JSONDecodeError:
        raise _ai_error("AI returned invalid JSON for resume generation")
    except Exception as e:
        raise _ai_error(str(e))
    return success({"resume": generated})


# ---------------------------------------------------------------------------
# POST /ai/optimize-resume — upload PDF + job desc, get optimized content
# ---------------------------------------------------------------------------

ALLOWED_MIME = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

MAX_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/optimize-resume")
async def optimize_resume(
    request: Request,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    form = await request.form()
    file = form.get("file")
    job_description = form.get("job_description") or ""

    if not file or not hasattr(file, "content_type"):
        raise HTTPException(
            status_code=400,
            detail={"code": "VALIDATION_ERROR", "message": "File field is required"},
        )

    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(
            status_code=400,
            detail={"code": "INVALID_REQUEST", "message": "Only PDF and DOCX files are accepted"},
        )

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(
            status_code=400,
            detail={"code": "INVALID_REQUEST", "message": "File size exceeds 5MB limit"},
        )

    ext = ".pdf" if file.content_type == "application/pdf" else ".docx"
    file_type = "pdf" if ext == ".pdf" else "docx"

    # Save original file permanently for "default" template
    user_upload_dir = Path(settings.UPLOAD_DIR) / str(current_user.id)
    user_upload_dir.mkdir(parents=True, exist_ok=True)
    file_uuid = uuid_lib.uuid4().hex
    original_path = user_upload_dir / f"{file_uuid}{ext}"
    original_path.write_bytes(content)

    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        tmp.write(content)
        tmp_path = Path(tmp.name)

    try:
        if ext == ".pdf":
            resume_text = extract_text(tmp_path)
        else:
            resume_text = extract_text_from_docx(tmp_path)
    finally:
        tmp_path.unlink(missing_ok=True)

    if not resume_text.strip():
        original_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=422,
            detail={"code": "PARSE_ERROR", "message": "Could not extract text from file"},
        )

    # Step 1: Parse resume using AI
    parse_prompt = f"{prompts.RESUME_PARSE_PROMPT}\n{resume_text}"
    try:
        raw_parsed = await ai_service.ai_complete(
            str(current_user.id), parse_prompt, db, max_tokens=4096
        )
        parsed = _extract_json(raw_parsed)
    except json.JSONDecodeError:
        original_path.unlink(missing_ok=True)
        raise _ai_error("AI returned invalid JSON during resume parsing")
    except Exception as e:
        original_path.unlink(missing_ok=True)
        raise _ai_error(str(e))

    # Step 2: Optimize parsed resume for the job description
    optimize_prompt = (
        f"{prompts.OPTIMIZE_RESUME_PROMPT}\n"
        f"Job Description: {job_description}\n"
        f"Parsed Resume: {json.dumps(parsed)}\n"
    )
    try:
        raw_optimized = await ai_service.ai_complete(
            str(current_user.id), optimize_prompt, db, max_tokens=4096
        )
        optimized = _extract_json(raw_optimized)
    except json.JSONDecodeError:
        original_path.unlink(missing_ok=True)
        raise _ai_error("AI returned invalid JSON during resume optimization")
    except Exception as e:
        original_path.unlink(missing_ok=True)
        raise _ai_error(str(e))

    # Extract visual style from original file for "default" template rendering
    from app.utils.style_extractor import extract_and_generate_template

    template_style = extract_and_generate_template(original_path, file_type)

    # Create resume record with original file reference
    try:
        title = optimized.get("personal", {}).get("job_title", "") or "Optimized Resume"
        content = resume_schemas.ResumeContent(**optimized)
        resume_in = resume_schemas.ResumeCreate(
            title=title,
            template_id="default",
            content=content,
        )
        resume = await resume_service.create_resume(db, current_user.id, resume_in)
        # Set original file + parsed data + template_style fields directly on the ORM instance
        setattr(resume, "original_file_path", str(original_path))
        setattr(resume, "original_file_type", file_type)
        if resume.data is not None:
            setattr(resume.data, "parsed_data", parsed)
            setattr(resume.data, "template_style", template_style)
        db.add(resume)
        await db.commit()
    except Exception as e:
        original_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "RESUME_CREATE_ERROR", "message": f"Failed to save resume: {e}"},
        )

    return success({
        "parsed": parsed,
        "optimized": optimized,
        "resume_id": str(resume.id),
    })
