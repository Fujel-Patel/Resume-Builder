"""Resumes router — PRD endpoints, always 404 (never 403) for ownership."""

import uuid
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.modules.resumes import schemas, service
from app.modules.users import models as user_models
from app.types.common import success
from app.utils.auth import get_current_user

router = APIRouter()


def _resume_to_dict(resume) -> dict:
    return schemas.ResumeResponse.model_validate(resume).model_dump()


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


# POST /resumes/{id}/export — PDF download
@router.post("/{resume_id}/export")
async def export_resume(
    resume_id: uuid.UUID,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    resume = await service.get_resume(db, resume_id, current_user.id)
    # TODO: render template + WeasyPrint → return FileResponse
    # from app.utils.pdf_exporter import html_to_pdf
    # html = render_resume_template(resume)
    # pdf_bytes = html_to_pdf(html)
    # return Response(pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=resume_{resume_id}.pdf"})
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={"code": "NOT_IMPLEMENTED", "message": "PDF export coming soon"},
    )


# POST /resumes/upload-scan — upload PDF → extract → return structured JSON
@router.post("/upload-scan")
async def upload_scan(
    file: UploadFile = File(...),
    current_user: user_models.User = Depends(get_current_user),
):
    if file.content_type not in ("application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_REQUEST", "message": "Only PDF and DOCX files are accepted"},
        )

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:  # 5MB limit per PRD
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_REQUEST", "message": "File size exceeds 5MB limit"},
        )

    # TODO: save to temp file → pdf_parser.extract_text → AI extract structured data
    # from app.utils.pdf_parser import extract_text
    # text = extract_text(tmp_path)
    # structured = await ai_service.extract_resume_structure(text, user_id, db)
    # return success(structured)
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={"code": "NOT_IMPLEMENTED", "message": "Resume upload scan coming soon"},
    )
