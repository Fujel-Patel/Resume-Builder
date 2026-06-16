"""ATS router — PRD response shape, proper error codes."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.modules.ats import schemas as ats_schemas
from app.modules.ats import service as ats_service
from app.modules.users import models as user_models
from app.types.common import success
from app.utils.auth import get_current_user
from app.utils.pdf_parser import extract_text, extract_text_from_docx

router = APIRouter()


def _scan_to_dict(scan) -> dict:
    return {
        "id": str(scan.id),
        "user_id": str(scan.user_id),
        "resume_id": str(scan.resume_id) if scan.resume_id else None,
        "overall_score": scan.overall_score,
        "score_report": scan.score_report,
        "job_description": scan.job_description,
        "created_at": scan.created_at.isoformat(),
    }


@router.post("/score")
async def score_ats(
    request: ats_schemas.ATSScoreRequest,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        scan = await ats_service.score_resume(
            user_id=current_user.id,
            resume_text=request.resume_text,
            job_description=request.job_description,
            db=db,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={"code": "AI_PROVIDER_ERROR", "message": str(e)},
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "INTERNAL_ERROR", "message": "ATS scoring failed"},
        )
    return success(_scan_to_dict(scan))


ALLOWED_MIME = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

MAX_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/score-upload")
async def score_ats_upload(
    request: Request,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    form = await request.form()
    file = form.get("file")
    job_description = form.get("job_description") or None

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

    import tempfile
    from pathlib import Path

    ext = ".pdf" if file.content_type == "application/pdf" else ".docx"
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
        raise HTTPException(
            status_code=422,
            detail={"code": "PARSE_ERROR", "message": "Could not extract text from file"},
        )

    try:
        scan = await ats_service.score_resume(
            user_id=current_user.id,
            resume_text=resume_text,
            job_description=job_description,
            db=db,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=422,
            detail={"code": "AI_PROVIDER_ERROR", "message": str(e)},
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail={"code": "INTERNAL_ERROR", "message": "ATS scoring failed"},
        )

    return success(_scan_to_dict(scan))


@router.get("/history")
async def get_ats_history(
    skip: int = 0,
    limit: int = 50,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    limit = min(limit, 100)  # hard cap
    scans = await ats_service.get_scans_by_user(db=db, user_id=current_user.id, skip=skip, limit=limit)
    return success([_scan_to_dict(s) for s in scans])


@router.get("/history/{scan_id}")
async def get_ats_scan(
    scan_id: uuid.UUID,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    scan = await ats_service.get_scan_by_id(db=db, scan_id=scan_id)
    # Ownership check — always 404 per PRD (never 403)
    if not scan or scan.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "ATS scan not found"},
        )
    return success(_scan_to_dict(scan))
