"""
Business logic for the ATS (Applicant Tracking System) score checker module.
Implements the flow described in the PRD (section 5.4) and uses the AI
module to generate a JSON score report.
"""

import json
import re
import uuid
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.ai import prompts as ai_prompts
from app.modules.ai import service as ai_service
from app.modules.ats import models as ats_models
from app.modules.ats import schemas as ats_schemas

# ----------------------------------------------------------------------
# Helper functions
# ----------------------------------------------------------------------


async def get_scan_by_id(
    db: AsyncSession, scan_id: uuid.UUID
) -> Optional[ats_models.ATSScan]:
    """Fetch a single ATS scan by its UUID."""
    result = await db.execute(
        select(ats_models.ATSScan).where(ats_models.ATSScan.id == scan_id)
    )
    return result.scalars().first()


async def get_scans_by_user(
    db: AsyncSession, user_id: uuid.UUID, skip: int = 0, limit: int = 100
) -> List[ats_models.ATSScan]:
    """Return a paginated list of ATS scans for a given user."""
    stmt = (
        select(ats_models.ATSScan)
        .where(ats_models.ATSScan.user_id == user_id)
        .order_by(ats_models.ATSScan.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def _create_scan(
    db: AsyncSession,
    user_id: uuid.UUID,
    scan_create: ats_schemas.ATSScanCreate,
) -> ats_models.ATSScan:
    """Persist a new ATS scan record.

    The `score_report` field is stored as JSONB for queryability.
    """
    db_scan = ats_models.ATSScan(
        user_id=user_id,
        resume_id=uuid.UUID(scan_create.resume_id) if scan_create.resume_id else None,
        job_description=scan_create.job_description,
        score_report=scan_create.score_report,
        overall_score=scan_create.overall_score,
    )
    db.add(db_scan)
    await db.commit()
    await db.refresh(db_scan)
    return db_scan


# ----------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------


def _extract_json(text: str) -> dict:
    """Extract JSON from AI response, stripping markdown fences and preamble."""
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

    return json.loads(text)


# ----------------------------------------------------------------------
# Core scoring flow – uses AI module
# ----------------------------------------------------------------------


async def score_resume(
    user_id: uuid.UUID,
    resume_text: str,
    job_description: Optional[str] = None,
    db: AsyncSession = None,
) -> ats_models.ATSScan:
    """Score a resume using the AI service and persist the result.

    Steps (as per PRD):
    1. Build a prompt that includes the ATS_SCORE_PROMPT, the raw resume text,
       and optionally the job description.
    2. Call ``ai_service.ai_complete`` which routes to the user's default AI
       provider and returns the raw JSON string.
    3. Parse the JSON into a dict and validate the required keys.
    4. Store the result in the ``ats_scans`` table.
    """
    # Build the prompt – combine the system prompt with the user data
    prompt_parts = [ai_prompts.ATS_SCORE_PROMPT]
    if job_description:
        prompt_parts.append("\nJob Description:\n" + job_description)
    prompt_parts.append("\nResume Text:\n" + resume_text)
    prompt = "\n".join(prompt_parts)

    # Call AI – this returns a raw string (likely JSON)
    raw_result = await ai_service.ai_complete(str(user_id), prompt, db)

    # Parse JSON – raise a clear error if the format is wrong
    try:
        result_dict = _extract_json(raw_result)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Failed to parse ATS AI response as JSON: {exc}")

    # Validate required keys (overall_score, section_scores, missing_keywords, suggestions)
    required_keys = {
        "overall_score",
        "section_scores",
        "missing_keywords",
        "suggestions",
    }
    if not required_keys.issubset(result_dict.keys()):
        missing = required_keys - result_dict.keys()
        raise ValueError(f"ATS AI response missing required keys: {missing}")

    # Prepare a schema object for consistency (optional but helpful)
    score_response = ats_schemas.ATSScoreResponse(**result_dict, score_report=result_dict)

    # Persist the scan using the internal create helper
    scan_create = ats_schemas.ATSScanCreate(
        job_description=job_description,
        resume_text=resume_text,
        overall_score=score_response.overall_score,
        score_report=result_dict,
        resume_id=None,
    )
    return await _create_scan(db, user_id, scan_create)
