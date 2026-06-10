from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List, Optional

from app.config.database import get_db
from app.modules.ats import schemas, service
from app.utils.jwt import verify_access_token
from app.modules.users import models as user_models
from app.modules.resumes import service as resume_service


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> user_models.User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = verify_access_token(token)
        if payload is None:
            raise credentials_exception
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await resume_service.get_user_by_id(db, uuid.UUID(user_id))
    if user is None:
        raise credentials_exception
    return user


# OAuth2 scheme for token extraction
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter()


@router.post("/score", response_model=schemas.ATSScanResponse)
async def score_ats(
    request: schemas.ATSScoreRequest,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Score resume for ATS compatibility"""
    try:
        # Score resume using AI
        scan = await service.score_resume(
            db=db,
            user_id=current_user.id,
            resume_text=request.resume_text,
            job_description=request.job_description
        )
        return scan
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ATS scoring error: {str(e)}"
        )


@router.get("/history", response_model=List[schemas.ATSScanResponse])
async def get_ats_history(
    skip: int = 0,
    limit: int = 100,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's ATS scan history"""
    scans = await service.get_scans_by_user(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    return scans


@router.get("/history/{scan_id}", response_model=schemas.ATSScanResponse)
async def get_ats_scan(
    scan_id: uuid.UUID,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get specific ATS scan by ID"""
    scan = await service.get_scan_by_id(db=db, scan_id=scan_id)
    if not scan or scan.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ATS scan not found"
        )
    return scan