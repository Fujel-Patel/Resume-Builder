"""Resume service — CRUD for resumes + resume_data."""

import uuid
from datetime import datetime
from typing import List

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.resumes import models, schemas


async def _get_resume_or_404(db: AsyncSession, resume_id: uuid.UUID) -> models.Resume:
    result = await db.execute(
        select(models.Resume)
        .options(selectinload(models.Resume.data))
        .where(models.Resume.id == resume_id, models.Resume.is_deleted.is_(False))
    )
    resume = result.scalars().first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Resume not found"},
        )
    return resume


async def get_resume(
    db: AsyncSession,
    resume_id: uuid.UUID,
    user_id: uuid.UUID,
) -> models.Resume:
    """Get resume + ownership check — always 404 (never 403) per PRD."""
    result = await db.execute(
        select(models.Resume)
        .options(selectinload(models.Resume.data))
        .where(
            models.Resume.id == resume_id,
            models.Resume.user_id == user_id,  # ownership baked in
            models.Resume.is_deleted.is_(False),
        )
    )
    resume = result.scalars().first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Resume not found"},
        )
    return resume


async def list_resumes(db: AsyncSession, user_id: uuid.UUID) -> List[models.Resume]:
    result = await db.execute(
        select(models.Resume)
        .options(selectinload(models.Resume.data))
        .where(models.Resume.user_id == user_id, models.Resume.is_deleted.is_(False))
        .order_by(models.Resume.created_at.desc())
    )
    return result.scalars().all()


async def create_resume(
    db: AsyncSession,
    user_id: uuid.UUID,
    resume_in: schemas.ResumeCreate,
) -> models.Resume:
    resume = models.Resume(
        user_id=user_id,
        title=resume_in.title,
        template_id=resume_in.template_id,
    )
    db.add(resume)
    await db.flush()  # get resume.id before creating ResumeData

    content = resume_in.content
    resume_data = models.ResumeData(
        resume_id=resume.id,
        personal=content.personal.model_dump() if content and content.personal else None,
        summary=content.summary if content else None,
        skills=content.skills if content else None,
        experience=[e.model_dump() for e in content.experience] if content and content.experience else None,
        projects=[p.model_dump() for p in content.projects] if content and content.projects else None,
        education=[e.model_dump() for e in content.education] if content and content.education else None,
        certifications=[c.model_dump() for c in content.certifications] if content and content.certifications else None,
        custom_sections=[s.model_dump() for s in content.custom_sections] if content and content.custom_sections else None,
    )
    db.add(resume_data)
    await db.commit()
    # re-fetch with data relationship loaded for the response
    result = await db.execute(
        select(models.Resume)
        .options(selectinload(models.Resume.data))
        .where(models.Resume.id == resume.id)
    )
    resume = result.scalars().first()
    return resume


async def update_resume(
    db: AsyncSession,
    resume_id: uuid.UUID,
    user_id: uuid.UUID,
    resume_in: schemas.ResumeUpdate,
) -> models.Resume:
    resume = await get_resume(db, resume_id, user_id)

    if resume_in.title is not None:
        resume.title = resume_in.title
    if resume_in.template_id is not None:
        resume.template_id = resume_in.template_id

    if resume_in.content is not None:
        content = resume_in.content
        if not resume.data:
            resume.data = models.ResumeData(resume_id=resume.id)
        rd = resume.data
        if content.personal is not None:
            rd.personal = content.personal.model_dump()
        if content.summary is not None:
            rd.summary = content.summary
        if content.skills is not None:
            rd.skills = content.skills
        if content.experience is not None:
            rd.experience = [e.model_dump() for e in content.experience]
        if content.projects is not None:
            rd.projects = [p.model_dump() for p in content.projects]
        if content.education is not None:
            rd.education = [e.model_dump() for e in content.education]
        if content.certifications is not None:
            rd.certifications = [c.model_dump() for c in content.certifications]
        if content.custom_sections is not None:
            rd.custom_sections = [s.model_dump() for s in content.custom_sections]
        db.add(rd)

    db.add(resume)
    await db.commit()
    # re-fetch with data relationship loaded for the response
    result = await db.execute(
        select(models.Resume)
        .options(selectinload(models.Resume.data))
        .where(models.Resume.id == resume.id)
    )
    resume = result.scalars().first()
    return resume


async def soft_delete_resume(
    db: AsyncSession,
    resume_id: uuid.UUID,
    user_id: uuid.UUID,
) -> None:
    resume = await get_resume(db, resume_id, user_id)
    resume.is_deleted = True
    resume.deleted_at = datetime.utcnow()
    db.add(resume)
    await db.commit()


def _extract_json(text: str) -> dict:
    """Extract JSON from AI response, stripping markdown fences and preamble."""
    import json
    import re

    text = text.strip()

    # Try to find ```json ... ``` or ``` ... ``` block
    match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", text, re.DOTALL)
    if match:
        text = match.group(1).strip()

    # Try to find { ... } with balanced braces
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

    return json.loads(text)


async def scan_resume(
    user_id: uuid.UUID,
    file_bytes: bytes,
    file_ext: str,
    db: AsyncSession,
) -> dict:
    """Save uploaded file, extract text, AI-parse into structured resume data."""
    import json
    import tempfile
    from pathlib import Path

    from app.modules.ai.prompts import RESUME_PARSE_PROMPT
    from app.modules.ai.service import ai_complete
    from app.utils.pdf_parser import extract_text, extract_text_from_docx

    suffix = ".pdf" if file_ext == "pdf" else ".docx"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(file_bytes)
        tmp_path = Path(tmp.name)

    try:
        if suffix == ".pdf":
            raw_text = extract_text(tmp_path)
        else:
            raw_text = extract_text_from_docx(tmp_path)
    finally:
        tmp_path.unlink(missing_ok=True)

    if not raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={"code": "PARSE_ERROR", "message": "Could not extract text from file"},
        )

    prompt = f"{RESUME_PARSE_PROMPT}\n\nResume Text:\n{raw_text[:10000]}"
    try:
        result = await ai_complete(str(user_id), prompt, db)
        parsed = _extract_json(result)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={"code": "AI_PARSE_ERROR", "message": "AI returned invalid JSON"},
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={"code": "AI_PROVIDER_ERROR", "message": str(e)},
        )

    return parsed
