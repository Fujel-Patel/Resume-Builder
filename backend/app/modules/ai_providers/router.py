from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List
from jose import JWTError

from app.config.database import get_db
from app.modules.ai_providers import schemas, service, models
from app.utils.jwt import verify_access_token
from app.modules.users import models as user_models


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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter()


@router.get("/", response_model=List[schemas.AIProviderResponse])
async def list_providers(
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List user's AI providers"""
    query = select(models.AIProvider).where(models.AIProvider.user_id == current_user.id)
    result = await db.execute(query)
    providers = result.scalars().all()
    return providers


@router.post("/", response_model=schemas.AIProviderResponse, status_code=status.HTTP_201_CREATED)
async def add_provider(
    provider_create: schemas.AIProviderCreate,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a new AI provider"""
    # Check if provider already exists for this user
    existing_provider = await service.get_provider_by_user_and_name(
        db, current_user.id, provider_create.provider_name
    )
    if existing_provider:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Provider {provider_create.provider_name} already exists"
        )

    # Create new provider
    provider = await service.create_provider(
        db, current_user.id, provider_create
    )
    return provider


@router.patch("/{provider_id}", response_model=schemas.AIProviderResponse)
async def update_provider(
    provider_id: uuid.UUID,
    provider_update: schemas.AIProviderUpdate,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update AI provider"""
    provider = await service.update_provider(
        db, provider_id, provider_update
    )
    if not provider or provider.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider not found"
        )
    return provider


@router.post("/{provider_id}/set-default", response_model=schemas.AIProviderResponse)
async def set_as_default_provider(
    provider_id: uuid.UUID,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Set AI provider as default"""
    success = await service.set_as_default_provider(
        db, provider_id, current_user.id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not set provider as default"
        )

    # Return updated provider
    provider = await service.get_provider_by_id(db, provider_id)
    return provider


@router.post("/{provider_id}/verify", response_model=schemas.AIProviderVerify)
async def verify_provider(
    provider_id: uuid.UUID,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Verify AI provider API key"""
    is_valid = await service.verify_provider_api_key(db, provider_id)
    return schemas.AIProviderVerify(valid=is_valid)


@router.delete("/{provider_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_provider(
    provider_id: uuid.UUID,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete AI provider"""
    success = await service.delete_provider(db, provider_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider not found"
        )
    return None