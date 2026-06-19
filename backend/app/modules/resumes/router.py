"""Resumes router — PRD endpoints, always 404 (never 403) for ownership."""

import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, Response, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
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


# POST /resumes/{id}/export — PDF (or original format for "default")
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
    if effective_template == "default":
        resume.template_id = "default"

    from app.modules.resumes.export import render_resume_to_pdf

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
    if effective_template == "default":
        resume.template_id = "default"

    from app.modules.resumes.export import render_resume_to_html

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
