"""AI router — PRD response shape, no raw returns."""

import json
import re
import time
from collections.abc import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, status
from fastapi.responses import StreamingResponse
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.modules.ai import prompts, schemas as ai_schemas, service as ai_service
from app.modules.resumes import schemas as resume_schemas
from app.modules.resumes import service as resume_service
from app.modules.users import models as user_models
from app.types.common import success
from app.utils.auth import get_current_user
from app.utils.pdf_parser import extract_text_from_bytes
router = APIRouter()


def _extract_json(text: str) -> dict:
    text = text.strip()
    match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", text, re.DOTALL)
    if match:
        text = match.group(1).strip()
    # Fast path: try the full text directly (json_mode providers return pure JSON)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    try:
        return json.loads(text, strict=False)
    except json.JSONDecodeError:
        pass
    # Fallback: brace-balanced extraction (handles fence-wrapped / truncated responses)
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


async def _safe_ai_complete(user_id: str, prompt: str, db: AsyncSession, max_tokens: int = 1024, json_mode: bool = False) -> str:
    _st = time.perf_counter()
    try:
        result = await ai_service.ai_complete(user_id, prompt, db, max_tokens, json_mode=json_mode)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise _ai_error(str(e))
    finally:
        _elapsed = time.perf_counter() - _st
        if _elapsed > 1.0:
            logger.info("AI_COMPLETE timing | user={} | tokens={} | elapsed={:.2f}s", user_id, max_tokens, _elapsed)


def _parse_json_safe(raw: str) -> dict | list:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return _extract_json(raw)


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
    ]
    if req.job_description:
        parts.append(f"Job Description: {req.job_description}")
    else:
        parts.append("Job Description: (not provided)")
    if req.current_summary:
        parts.append(f"Current Summary: {req.current_summary}")
    prompt = "\n".join(parts)
    result = await _safe_ai_complete(str(current_user.id), prompt, db)
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
        "IMPORTANT: Extract ALL skills mentioned in the job description above "
        "and add them to the appropriate groups. Keep all current skills. "
        "Do NOT skip any skill from the JD.\n"
    )
    raw = await _safe_ai_complete(str(current_user.id), prompt, db, json_mode=True)
    try:
        skills = _parse_json_safe(raw)
    except json.JSONDecodeError:
        raise _ai_error("AI returned invalid JSON for skills list")
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
    raw = await _safe_ai_complete(str(current_user.id), prompt, db, json_mode=True)
    try:
        bullets = _parse_json_safe(raw)
    except json.JSONDecodeError:
        raise _ai_error("AI returned invalid JSON for experience bullets")
    if not isinstance(bullets, list):
        bullets = [str(bullets)]
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
    raw = await _safe_ai_complete(str(current_user.id), prompt, db, json_mode=True)
    try:
        improved = _parse_json_safe(raw)
    except json.JSONDecodeError:
        raise _ai_error("AI returned invalid JSON for project descriptions")
    if isinstance(improved, dict):
        improved = list(improved.values())[0]
    if not isinstance(improved, list):
        improved = [str(improved)]
    return success({"projects": improved})


# ---------------------------------------------------------------------------
# POST /ai/suggest/job-title
# ---------------------------------------------------------------------------


@router.post("/suggest/job-title")
async def suggest_job_title(
    req: ai_schemas.JobTitleRequest,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    parts = [prompts.JOB_TITLE_PROMPT, f"Job Description: {req.job_description}"]
    if req.current_title:
        parts.append(f"Current Title: {req.current_title}")
    prompt = "\n".join(parts)
    raw = (await _safe_ai_complete(str(current_user.id), prompt, db)).strip()
    import re as _re
    for sep in (" – ", " — ", " - ", " –", "—", " –– ", " | ", " |", ", "):
        if sep in raw:
            raw = raw.split(sep)[0].strip()
    raw = _re.sub(r"\s+\(.*?\)", "", raw).strip()
    return success({"title": raw})


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
    raw = await _safe_ai_complete(str(current_user.id), prompt, db, json_mode=True)
    try:
        generated = _parse_json_safe(raw)
    except json.JSONDecodeError:
        raise _ai_error("AI returned invalid JSON for resume generation")
    return success({"resume": generated})


# ---------------------------------------------------------------------------
# POST /ai/optimize-resume — upload PDF + job desc, get optimized content
# ---------------------------------------------------------------------------

ALLOWED_MIME = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

MAX_SIZE = 5 * 1024 * 1024  # 5 MB

# ---------------------------------------------------------------------------
# SSE helpers
# ---------------------------------------------------------------------------


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


def _sse_error(code: str, message: str) -> str:
    return _sse("error", {"stage": "failed", "code": code, "message": message})


def _log_raw_response(raw: str, extracted: str = "", provider: str = "", model: str = "") -> None:
    logger.warning(
        "SSE_RAW_RESPONSE | provider={} | model={} | raw_len={} | extracted_len={} | "
        "raw_preview={} | extracted_preview={}",
        provider,
        model,
        len(raw),
        len(extracted),
        raw[:500],
        extracted[:500],
    )


def _sanitize_nim_output(data: dict) -> None:
    """Coerce NIM json_mode type inconsistencies before Pydantic validation.

    NIM's json_mode returns null/{} for empty fields and sometimes strings
    instead of lists (or vice versa). This mutates |data| in-place.
    """
    for _k in ("skills", "experience", "projects", "education", "certifications", "custom_sections"):
        if isinstance(data.get(_k), dict):
            data[_k] = None
    for _item in (data.get("projects") or []):
        if isinstance(_item, dict) and isinstance(_item.get("description"), list):
            _item["description"] = " ".join(str(x) for x in _item["description"] if x)
    for _item in (data.get("experience") or []):
        if isinstance(_item, dict):
            _b = _item.get("bullets")
            if isinstance(_b, str):
                _item["bullets"] = [_b]
            elif isinstance(_b, dict):
                _item["bullets"] = None
    _personal = data.get("personal")
    if isinstance(_personal, dict):
        for _k, _v in list(_personal.items()):
            if _v is None:
                _personal[_k] = ""


async def _optimize_resume_events(
    current_user: user_models.User,
    db: AsyncSession,
    file: UploadFile,
    job_description: str,
) -> AsyncGenerator[str, None]:
    """Async generator yielding SSE events for each stage of optimize-resume."""
    _t0 = time.perf_counter()
    stage_timers: dict[str, float] = {}

    def _emit(stage: str, progress: int, label: str, extra: dict | None = None) -> str:
        data: dict[str, object] = {
            "stage": stage,
            "progress": progress,
            "stage_label": label,
        }
        if extra:
            data["data"] = extra
        return _sse("progress", data)

    try:
        # --- Stage 1: Validation ---
        yield _emit("uploading", 0, "Validating file...")
        content = await file.read()
        if len(content) > MAX_SIZE:
            yield _sse_error("INVALID_REQUEST", "File size exceeds 5MB limit")
            return
        ext = "pdf" if file.content_type == "application/pdf" else "docx"
        stage_timers["upload"] = time.perf_counter() - _t0

        # --- Stage 2: Extraction ---
        _tx = time.perf_counter()
        yield _emit("extracting", 10, "Extracting text from resume...")
        resume_text = extract_text_from_bytes(content, ext)
        stage_timers["extraction"] = time.perf_counter() - _tx

        if not resume_text.strip():
            if ext == "pdf":
                yield _sse_error(
                    "PARSE_ERROR",
                    "Could not extract text from file. The PDF may be image-based "
                    "(scanned) or encrypted. Please upload a text-based PDF or DOCX.",
                )
            else:
                yield _sse_error(
                    "PARSE_ERROR",
                    "Could not extract text from file. "
                    "Please ensure the DOCX contains readable text.",
                )
            return

        # --- Stage 3: AI optimization ---
        combined_prompt = (
            f"{prompts.PARSE_AND_OPTIMIZE_PROMPT}\n"
            f"Resume Text: {resume_text}\n"
        )
        if job_description.strip():
            combined_prompt += f"Job Description: {job_description}\n"
        else:
            combined_prompt += "Job Description: (not provided)\n"

        yield _emit("optimizing", 25, "Optimizing resume content...")
        _tx = time.perf_counter()
        try:
            raw = await ai_service.ai_complete(
                str(current_user.id), combined_prompt, db, max_tokens=8192, json_mode=True
            )
        except Exception as e:
            logger.error("SSE_AI_FAILURE | user={} | error={}", current_user.id, e)
            yield _sse_error("AI_PROVIDER_ERROR", f"AI request failed: {e}")
            return
        stage_timers["optimization"] = time.perf_counter() - _tx

        # --- Stage 4: Validation / JSON parse ---
        yield _emit("validating", 85, "Validating AI response...")
        _tx = time.perf_counter()
        try:
            combined = _extract_json(raw)
        except json.JSONDecodeError:
            _log_raw_response(raw)
            yield _sse_error("AI_PROVIDER_ERROR", "AI returned invalid JSON")
            return

        if "parsed" not in combined and "optimized" not in combined:
            parsed = combined
        else:
            parsed = combined.get("parsed", {}) or {}
        optimized = combined.get("optimized", parsed) if job_description.strip() else parsed

        if optimized is not parsed and job_description.strip():
            extra_keys = set(optimized.keys()) - set(parsed.keys())
            if extra_keys:
                optimized = parsed

            protected = {"education", "certifications", "custom_sections"}
            for key in protected:
                if json.dumps(optimized.get(key)) != json.dumps(parsed.get(key)):
                    optimized = parsed
                    break

            if optimized is not parsed:
                pp = parsed.get("personal") or {}
                op = optimized.get("personal") or {}
                for field in ("first_name", "last_name", "email", "mobile", "address"):
                    if op.get(field) != pp.get(field):
                        optimized = parsed
                        break
        stage_timers["validation"] = time.perf_counter() - _tx

        # --- Stage 5: Database save ---
        yield _emit("saving", 92, "Saving to database...")
        _tx = time.perf_counter()
        try:
            # NIM json_mode returns null/{} for empty fields — coerce before Pydantic
            _sanitize_nim_output(optimized)

            title = optimized.get("personal", {}).get("job_title", "") or "Optimized Resume"
            content = resume_schemas.ResumeContent(**optimized)
            resume_in = resume_schemas.ResumeCreate(
                title=title,
                template_id="modern",
                content=content,
            )
            resume = await resume_service.create_resume(db, current_user.id, resume_in)
        except Exception as e:
            logger.error("SSE_DB_FAILURE | user={} | error={}", current_user.id, e)
            yield _sse_error("RESUME_CREATE_ERROR", f"Failed to save resume: {e}")
            return
        stage_timers["saving"] = time.perf_counter() - _tx

        total = time.perf_counter() - _t0

        logger.info(
            "OPTIMIZE_RESUME_STREAM timing | user={} | upload={:.2f}s | extract={:.2f}s "
            "| optimize={:.2f}s | validate={:.2f}s | save={:.2f}s | total={:.2f}s",
            current_user.id,
            stage_timers.get("upload", 0),
            stage_timers.get("extraction", 0),
            stage_timers.get("optimization", 0),
            stage_timers.get("validation", 0),
            stage_timers.get("saving", 0),
            total,
        )

        yield _sse("completed", {
            "parsed": parsed,
            "optimized": optimized,
            "resume_id": str(resume.id),
        })
    except Exception as e:
        logger.exception("SSE_UNEXPECTED | user={} | error={}", current_user.id, e)
        yield _sse_error("UNEXPECTED_ERROR", f"An unexpected error occurred: {e}")


@router.post("/optimize-resume/stream")
async def optimize_resume_stream(
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

    return StreamingResponse(
        _optimize_resume_events(current_user, db, file, job_description),
        media_type="text/event-stream",
        headers={
            "X-Accel-Buffering": "no",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


@router.post("/optimize-resume")
async def optimize_resume(
    request: Request,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _t0 = time.perf_counter()

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

    ext = "pdf" if file.content_type == "application/pdf" else "docx"

    _t1 = time.perf_counter()
    resume_text = extract_text_from_bytes(content, ext)
    _t2 = time.perf_counter()

    if not resume_text.strip():
        if ext == "pdf":
            msg = (
                "Could not extract text from file. The PDF may be image-based "
                "(scanned) or encrypted. Please upload a text-based PDF or DOCX."
            )
        else:
            msg = (
                "Could not extract text from file. "
                "Please ensure the DOCX contains readable text."
            )
        raise HTTPException(
            status_code=422,
            detail={"code": "PARSE_ERROR", "message": msg},
        )

    # Single combined AI call: parse + optimize
    combined_prompt = (
        f"{prompts.PARSE_AND_OPTIMIZE_PROMPT}\n"
        f"Resume Text: {resume_text}\n"
    )
    if job_description.strip():
        combined_prompt += f"Job Description: {job_description}\n"
    else:
        combined_prompt += "Job Description: (not provided)\n"

    _t3 = time.perf_counter()
    try:
        raw = await ai_service.ai_complete(
            str(current_user.id), combined_prompt, db, max_tokens=8192, json_mode=True
        )
    except Exception as e:
        raise _ai_error(f"AI request failed: {e}")
    _t4 = time.perf_counter()
    try:
        combined = _extract_json(raw)
    except json.JSONDecodeError as e:
        raise _ai_error(f"AI returned invalid JSON: {e}")
    _t5 = time.perf_counter()

    if "parsed" not in combined and "optimized" not in combined:
        parsed = combined
    else:
        parsed = combined.get("parsed", {}) or {}
    optimized = combined.get("optimized", parsed) if job_description.strip() else parsed

    # Validate optimized when JD was provided
    if optimized is not parsed and job_description.strip():
        extra_keys = set(optimized.keys()) - set(parsed.keys())
        if extra_keys:
            optimized = parsed

        protected = {"education", "certifications", "custom_sections"}
        for key in protected:
            if json.dumps(optimized.get(key)) != json.dumps(parsed.get(key)):
                optimized = parsed
                break

        if optimized is not parsed:
            pp = parsed.get("personal") or {}
            op = optimized.get("personal") or {}
            for field in ("first_name", "last_name", "email", "mobile", "address"):
                if op.get(field) != pp.get(field):
                    optimized = parsed
                    break

    # Create resume record
    _t6 = time.perf_counter()
    try:
        # NIM json_mode returns null/{} for empty fields — coerce before Pydantic
        _sanitize_nim_output(optimized)

        title = optimized.get("personal", {}).get("job_title", "") or "Optimized Resume"
        content = resume_schemas.ResumeContent(**optimized)
        resume_in = resume_schemas.ResumeCreate(
            title=title,
            template_id="modern",
            content=content,
        )
        resume = await resume_service.create_resume(db, current_user.id, resume_in)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "RESUME_CREATE_ERROR", "message": f"Failed to save resume: {e}"},
        )
    _t7 = time.perf_counter()

    logger.info(
        "OPTIMIZE_RESUME timing | user={} | pdf_parse={:.2f}s | ai_request={:.2f}s "
        "| json_extract={:.2f}s | db_save={:.2f}s | total={:.2f}s",
        current_user.id,
        _t2 - _t1,
        _t4 - _t3,
        _t5 - _t4,
        _t7 - _t6,
        _t7 - _t0,
    )

    return success({
        "parsed": parsed,
        "optimized": optimized,
        "resume_id": str(resume.id),
    })
