"""
FastAPI router for ATS (Applicant Tracking System) score checker.
Implements the endpoints described in the PRD (section 5.4 / ATS Endpoints).
"""

import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.modules.ats import schemas as ats_schemas
from app.modules.ats import service as ats_service
from app.modules.users import models as user_models
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/ats",
    tags=["ats"],
    responses={404: {"description": "Not found"}},
)


# ----------------------------------------------------------------------
# Endpoints
# ----------------------------------------------------------------------


@router.post("/score", response_model=ats_schemas.ATSScanResponse)
async def score_ats(
    request: ats_schemas.ATSScoreRequest,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Score a resume (or raw resume text) using AI and store the result."""
    try:
        scan = await ats_service.score_resume(
            user_id=current_user.id,
            resume_text=request.resume_text,
            job_description=request.job_description,
            db=db,
        )
        return scan
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"ATS scoring error: {str(exc)}",
        )


@router.get("/history", response_model=List[ats_schemas.ATSScanResponse])
async def get_ats_history(
    skip: int = 0,
    limit: int = 100,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return paginated ATS scan history for the authenticated user."""
    scans = await ats_service.get_scans_by_user(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )
    return scans


@router.get("/history/{scan_id}", response_model=ats_schemas.ATSScanResponse)
async def get_ats_scan(
    scan_id: uuid.UUID,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch a single ATS scan record. Ensures the scan belongs to the user."""
    scan = await ats_service.get_scan_by_id(db=db, scan_id=scan_id)
    if not scan or scan.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="ATS scan not found")
    return scan
