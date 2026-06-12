import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.modules.resumes import models, schemas
from app.modules.resumes import service as resume_service
from app.modules.users import models as user_models
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/resumes",
    tags=["resumes"],
    responses={404: {"description": "Not found"}},
)


# ----------------------------------------------------------------------
# Endpoints
# ----------------------------------------------------------------------
@router.get("", response_model=list[schemas.ResumePublic])
async def list_resumes(
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all resumes belonging to the authenticated user."""
    resume_svc = resume_service.ResumeService(db)
    return await resume_svc.get_resumes_by_user(current_user.id)


@router.post(
    "", response_model=schemas.ResumePublic, status_code=status.HTTP_201_CREATED
)
async def create_resume(
    resume_in: schemas.ResumeCreate,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new resume for the authenticated user."""
    resume_svc = resume_service.ResumeService(db)
    return await resume_svc.create_resume(user_id=current_user.id, resume_in=resume_in)


@router.get("/{resume_id}", response_model=schemas.ResumePublic)
async def get_resume(
    resume_id: uuid.UUID,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific resume by ID (ensures ownership)."""
    resume_svc = resume_service.ResumeService(db)
    resume = await resume_svc.get_resume_by_id(resume_id)
    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to access this resume"
        )
    return resume


@router.patch("/{resume_id}", response_model=schemas.ResumePublic)
async def update_resume(
    resume_id: uuid.UUID,
    resume_in: schemas.ResumeUpdate,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a resume (partial update)."""
    resume_svc = resume_service.ResumeService(db)
    resume = await resume_svc.get_resume_by_id(resume_id)
    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this resume"
        )
    return await resume_svc.update_resume(resume_id, resume_in)


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: uuid.UUID,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Deactivate a resume (soft delete)."""
    resume_svc = resume_service.ResumeService(db)
    resume = await resume_svc.get_resume_by_id(resume_id)
    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this resume"
        )
    await resume_svc.deactivate_resume(resume_id)
    return None


# ----------------------------------------------------------------------
# AI‑generation endpoint (example)
# ----------------------------------------------------------------------
@router.post("/generate", response_model=schemas.ResumePublic)
async def generate_resume_ai(
    request: dict,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    1. Use the AI module to turn a prompt into structured resume data.
    2. Render that data into HTML (using a template provided by the client or a default one).
    3. Export to PDF and store the file URL.
    4. Persist the resume record.
    """
    resume_svc = resume_service.ResumeService(db)
    # Pseudo‑code – replace with actual AI service call
    # structured_data = await ai_service.generate_resume_data(prompt=request["prompt"])
    # html = render_template(request["template_html"], structured_data)
    # pdf_url = await resume_svc.export_resume_to_pdf(...)
    # resume_in = schemas.ResumeCreate(title="AI Generated", data=structured_data, file_url=pdf_url)
    # return await resume_svc.create_resume(current_user.id, resume_in)
    raise NotImplementedError("AI generation endpoint – delegate to AI module")


# ----------------------------------------------------------------------
# ATS scoring endpoint (example)
# ----------------------------------------------------------------------
@router.post("/{resume_id}/score", response_model=dict)
async def score_resume_ats(
    resume_id: uuid.UUID,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    1. Fetch the resume.
    2. Extract text (if stored as PDF) or use the structured data.
    3. Call the ATS module to compute scores.
    4. Return the scores.
    """
    resume_svc = resume_service.ResumeService(db)
    resume = await resume_svc.get_resume_by_id(resume_id)
    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to score this resume"
        )
    # Pseudo‑code – replace with actual ATS service call
    # text = await resume_svc.extract_resume_text(resume.file_url) if resume.file_url else json.dumps(resume.data)
    # scores = await ats_service.score_resume(text)
    # return scores
    raise NotImplementedError("ATS scoring endpoint – delegate to ATS module")
