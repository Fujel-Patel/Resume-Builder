from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List, Optional

from app.config.database import get_db
from app.modules.resumes import schemas, service
from app.utils.jwt import verify_access_token
from app.modules.users import models as user_models
from app.modules.ai_providers import service as ai_provider_service
from app.utils.ownership import assert_ownership


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

    user = await service.get_user_by_id(db, uuid.UUID(user_id))
    if user is None:
        raise credentials_exception
    return user


# OAuth2 scheme for token extraction
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter()


@router.post("/", response_model=schemas.ResumeWithDataResponse, status_code=status.HTTP_201_CREATED)
async def create_resume_endpoint(
    resume_create: schemas.ResumeCreate,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new resume"""
    resume = await service.create_resume(db, current_user.id, resume_create)
    resume_data = await service.get_resume_data(db, resume.id)

    return schemas.ResumeWithDataResponse(
        resume=resume,
        data=resume_data
    )


@router.get("/", response_model=List[schemas.ResumeResponse])
async def list_resumes(
    skip: int = 0,
    limit: int = 100,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List user's resumes"""
    resumes = await service.get_resumes_by_user(db, current_user.id, skip=skip, limit=limit)
    return resumes


@router.get("/{resume_id}", response_model=schemas.ResumeWithDataResponse)
async def get_resume(
    resume_id: uuid.UUID,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get resume by ID"""
    resume = await service.get_resume_by_id_and_user(db, resume_id, current_user.id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )

    resume_data = await service.get_resume_data(db, resume.id)
    if not resume_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume data not found"
        )

    return schemas.ResumeWithDataResponse(
        resume=resume,
        data=resume_data
    )


@router.patch("/{resume_id}", response_model=schemas.ResumeWithDataResponse)
async def update_resume_endpoint(
    resume_id: uuid.UUID,
    resume_update: schemas.ResumeUpdate,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update resume"""
    resume = await service.update_resume(db, resume_id, current_user.id, resume_update)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )

    resume_data = await service.get_resume_data(db, resume.id)

    return schemas.ResumeWithDataResponse(
        resume=resume,
        data=resume_data
    )


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume_endpoint(
    resume_id: uuid.UUID,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete resume"""
    success = await service.delete_resume(db, resume_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    return None


@router.post("/{resume_id}/export")
async def export_resume(
    resume_id: uuid.UUID,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Export resume as PDF"""
    pdf_bytes = await service.export_resume_as_pdf(db, resume_id, current_user.id)

    # In a real implementation, we would return a StreamingResponse
    # For now, we'll return the bytes directly
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=resume_{resume_id}.pdf"}
    )


@router.post("/upload-scan", response_model=schemas.ResumeWithDataResponse)
async def upload_and_scan_resume(
    file: UploadFile = File(...),
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload and parse existing resume"""
    # Validate file type
    if not file.filename.lower().endswith(('.pdf', '.docx')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and DOCX files are supported"
        )

    # Read file content
    file_content = await file.read()

    # Validate file size (5MB limit)
    if len(file_content) > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 5MB limit"
        )

    # Process file
    resume, resume_data = await service.upload_and_parse_resume(
        db=db,
        user_id=current_user.id,
        file_content=file_content,
        filename=file.filename
    )

    return schemas.ResumeWithDataResponse(
        resume=resume,
        data=resume_data
    )