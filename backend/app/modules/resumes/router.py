"""Resumes router — PRD endpoints, always 404 (never 403) for ownership."""

import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, Response, UploadFile, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.config.settings import settings
from app.modules.resumes import schemas, service
from app.modules.users import models as user_models
from app.types.common import success
from app.utils.auth import get_current_user

router = APIRouter()


def _resume_to_dict(resume) -> dict:
    return schemas.ResumeResponse.model_validate(resume).model_dump()


def _cors_response(response: Response, request: Request) -> Response:
    origin = request.headers.get("origin", "")
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
    return response


# GET /resumes/dashboard — batch endpoint: user + resumes + ATS history in one call
@router.get("/dashboard")
async def get_dashboard_summary(
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Single endpoint that returns everything the dashboard needs.

    Eliminates 3 sequential frontend calls (users/me + resumes + ats/history)
    by aggregating them server-side with parallel DB queries.
    """
    import asyncio
    from sqlalchemy import select
    from app.modules.ats import models as ats_models

    resumes_task = service.list_resumes(db, current_user.id)
    scans_task = db.execute(
        select(ats_models.ATSScan)
        .where(ats_models.ATSScan.user_id == current_user.id)
        .order_by(ats_models.ATSScan.created_at.desc())
        .limit(20)
    )

    resumes, scans_result = await asyncio.gather(resumes_task, scans_task)
    scans = list(scans_result.scalars().all())

    return success({
        "user": {
            "id": str(current_user.id),
            "name": current_user.name,
            "email": current_user.email,
            "is_verified": current_user.is_verified,
            "is_active": current_user.is_active,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
            "updated_at": current_user.updated_at.isoformat() if current_user.updated_at else None,
        },
        "resumes": [_resume_to_dict(r) for r in resumes],
        "ats_history": [
            {
                "id": str(s.id),
                "resume_id": str(s.resume_id) if s.resume_id else None,
                "overall_score": s.overall_score,
                "score_report": s.score_report,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in scans
        ],
    })


# GET /resumes
@router.get("")
async def list_resumes(
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    resumes = await service.list_resumes(db, current_user.id)
    return success([_resume_to_dict(r) for r in resumes])


# POST /resumes
@router.post("", status_code=status.HTTP_201_CREATED)
async def create_resume(
    body: schemas.ResumeCreate,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    resume = await service.create_resume(db, current_user.id, body)
    return success(_resume_to_dict(resume))


# GET /resumes/{id}
@router.get("/{resume_id}")
async def get_resume(
    resume_id: uuid.UUID,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # PRD: ownership fail = 404, never 403 (prevents enumeration)
    resume = await service.get_resume(db, resume_id, current_user.id)
    return success(_resume_to_dict(resume))


# PATCH /resumes/{id}
@router.patch("/{resume_id}")
async def update_resume(
    resume_id: uuid.UUID,
    body: schemas.ResumeUpdate,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    resume = await service.update_resume(db, resume_id, current_user.id, body)
    return success(_resume_to_dict(resume))


# DELETE /resumes/{id} — soft delete
@router.delete("/{resume_id}", status_code=status.HTTP_200_OK)
async def delete_resume(
    resume_id: uuid.UUID,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await service.soft_delete_resume(db, resume_id, current_user.id)
    return success({"message": "Resume deleted"})


# POST /resumes/{id}/export — PDF (Jinja2)
@router.post("/{resume_id}/export")
async def export_resume(
    request: Request,
    resume_id: uuid.UUID,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    template: str = Query(None, description="Override template ID for this export"),
):
    resume = await service.get_resume(db, resume_id, current_user.id)

    effective_template = template or str(resume.template_id)

    from app.modules.resumes.export import render_resume_to_pdf

    resume.template_id = effective_template  # type: ignore[assignment]

    try:
        pdf_bytes = render_resume_to_pdf(resume)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "PDF_GENERATION_ERROR", "message": f"Failed to generate PDF: {e}"},
        )

    filename = f"resume_{resume_id}.pdf"
    return _cors_response(
        Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        ),
        request,
    )


# POST /resumes/{id}/export/pdf — Playwright-generated A4 PDF
@router.post("/{resume_id}/export/pdf")
async def export_resume_pdf(
    request: Request,
    resume_id: uuid.UUID,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    template_id: str = Query(None, description="Override template ID (from frontend selection)"),
):
    resume = await service.get_resume(db, resume_id, current_user.id)

    # Use frontend-provided template_id if given, otherwise fall back to DB
    effective_template = template_id or str(resume.template_id)

    try:
        from app.services.html_renderer import render_resume_to_html
        from app.services.pdf_service import generate_pdf

        resume_dict = _resume_to_dict(resume)
        html = render_resume_to_html(resume_dict, effective_template)
        pdf_bytes = await generate_pdf(html, timeout_ms=settings.PDF_EXPORT_TIMEOUT_MS)
    except ImportError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "PDF_SERVICE_UNAVAILABLE", "message": f"PDF export service not available: {e}"},
        )
    except Exception as e:
        logger.exception("PDF export failed for resume {}", resume_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "PDF_GENERATION_ERROR", "message": f"Failed to generate PDF: {e}"},
        )

    # Build filename: Firstname_Lastname_TemplateId.pdf
    data = resume.data
    personal = data.personal if data else {}
    first = (personal.get("first_name") or "").strip().replace(" ", "_")
    last = (personal.get("last_name") or "").strip().replace(" ", "_")
    tid = str(resume.template_id).replace("-", " ").title().replace(" ", "_")
    filename = f"{first}_{last}_{tid}.pdf" if first or last else f"resume_{resume_id}.pdf"

    return _cors_response(
        Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        ),
        request,
    )


# GET /resumes/{id}/preview-html — rendered HTML for live preview
@router.get("/{resume_id}/preview-html")
async def preview_html(
    request: Request,
    resume_id: uuid.UUID,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    template: str = Query(None, description="Override template ID for this preview"),
):
    resume = await service.get_resume(db, resume_id, current_user.id)

    effective_template = template or str(resume.template_id)

    from app.modules.resumes.export import render_resume_to_html

    resume.template_id = effective_template  # type: ignore[assignment]

    try:
        html_content = render_resume_to_html(resume)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "HTML_GENERATION_ERROR", "message": f"Failed to generate preview: {e}"},
        )

    return _cors_response(
        Response(
            content=html_content,
            media_type="text/html; charset=utf-8",
        ),
        request,
    )


# POST /resumes/upload-scan — upload PDF → AI extract → return structured JSON
@router.post("/upload-scan")
async def upload_scan(
    file: UploadFile = File(...),
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ("application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_REQUEST", "message": "Only PDF and DOCX files are accepted"},
        )

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_REQUEST", "message": "File size exceeds 5MB limit"},
        )

    ext = "pdf" if file.content_type == "application/pdf" else "docx"
    parsed = await service.scan_resume(current_user.id, content, ext, db)
    return success(parsed)
