"""AI provider settings — full CRUD (was placeholder with NotImplementedError)."""

import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.modules.ai.models import AIProvider
from app.modules.ai.service import _validate_base_url, verify_api_key
from app.modules.users import models as user_models
from app.types.common import success
from app.utils.auth import get_current_user
from app.utils.encryption import decrypt, encrypt

router = APIRouter()

VALID_PROVIDERS = {"anthropic", "gemini", "nvidia-nim", "custom"}


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class AIProviderCreate(BaseModel):
    provider_name: str = Field(..., description="anthropic | gemini | nvidia-nim | custom")
    api_key: str = Field(..., min_length=1)
    base_url: Optional[str] = None
    is_default: bool = False

    model_config = ConfigDict(str_strip_whitespace=True)


class AIProviderUpdate(BaseModel):
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    is_default: Optional[bool] = None

    model_config = ConfigDict(str_strip_whitespace=True)


class AIProviderVerifyRequest(BaseModel):
    provider_name: str
    api_key: str
    base_url: Optional[str] = None

    model_config = ConfigDict(str_strip_whitespace=True)


class AIProviderResponse(BaseModel):
    id: uuid.UUID
    provider_name: str
    base_url: Optional[str]
    is_default: bool
    is_verified: bool

    model_config = ConfigDict(from_attributes=True)
    # NOTE: api_key_encrypted is NEVER returned to client


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _not_found() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail={"code": "NOT_FOUND", "message": "AI provider not found"},
    )


async def _get_provider(
    db: AsyncSession, provider_id: uuid.UUID, user_id: uuid.UUID
) -> AIProvider:
    result = await db.execute(
        select(AIProvider).where(
            AIProvider.id == provider_id,
            AIProvider.user_id == user_id,  # ownership always 404
        )
    )
    provider = result.scalars().first()
    if not provider:
        raise _not_found()
    return provider


async def _clear_default(db: AsyncSession, user_id: uuid.UUID) -> None:
    """Unset is_default on all providers for user — called before setting new default."""
    result = await db.execute(
        select(AIProvider).where(AIProvider.user_id == user_id, AIProvider.is_default.is_(True))
    )
    for p in result.scalars().all():
        p.is_default = False
        db.add(p)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("")
async def list_providers(
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AIProvider).where(AIProvider.user_id == current_user.id)
    )
    providers = result.scalars().all()
    return success([AIProviderResponse.model_validate(p).model_dump() for p in providers])


@router.post("", status_code=status.HTTP_201_CREATED)
async def add_provider(
    body: AIProviderCreate,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.provider_name not in VALID_PROVIDERS:
        raise HTTPException(
            status_code=400,
            detail={"code": "VALIDATION_ERROR", "message": f"provider_name must be one of {VALID_PROVIDERS}"},
        )

    if body.base_url:
        try:
            body.base_url = _validate_base_url(body.base_url)
        except ValueError as e:
            raise HTTPException(status_code=400, detail={"code": "VALIDATION_ERROR", "message": str(e)})

    # Check for existing provider with same name
    existing = await db.execute(
        select(AIProvider).where(
            AIProvider.user_id == current_user.id,
            AIProvider.provider_name == body.provider_name,
        )
    )
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "CONFLICT", "message": f"Provider '{body.provider_name}' already configured. Use PATCH to update."},
        )

    if body.is_default:
        await _clear_default(db, current_user.id)

    provider = AIProvider(
        user_id=current_user.id,
        provider_name=body.provider_name,
        api_key_encrypted=encrypt(body.api_key),
        base_url=body.base_url,
        is_default=body.is_default,
        is_verified=False,
    )
    db.add(provider)
    await db.commit()
    await db.refresh(provider)
    return success(AIProviderResponse.model_validate(provider).model_dump())


@router.patch("/{provider_id}")
async def update_provider(
    provider_id: uuid.UUID,
    body: AIProviderUpdate,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    provider = await _get_provider(db, provider_id, current_user.id)

    if body.base_url is not None:
        try:
            provider.base_url = _validate_base_url(body.base_url) if body.base_url else None
        except ValueError as e:
            raise HTTPException(status_code=400, detail={"code": "VALIDATION_ERROR", "message": str(e)})

    if body.api_key is not None:
        provider.api_key_encrypted = encrypt(body.api_key)
        provider.is_verified = False  # new key must be re-verified

    if body.is_default is True:
        await _clear_default(db, current_user.id)
        provider.is_default = True
    elif body.is_default is False:
        provider.is_default = False

    db.add(provider)
    await db.commit()
    await db.refresh(provider)
    return success(AIProviderResponse.model_validate(provider).model_dump())


@router.delete("/{provider_id}", status_code=status.HTTP_200_OK)
async def delete_provider(
    provider_id: uuid.UUID,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    provider = await _get_provider(db, provider_id, current_user.id)
    await db.delete(provider)
    await db.commit()
    return success({"message": "AI provider removed"})


@router.post("/verify")
async def verify_provider(
    body: AIProviderVerifyRequest,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.provider_name not in VALID_PROVIDERS:
        raise HTTPException(
            status_code=400,
            detail={"code": "VALIDATION_ERROR", "message": f"Unknown provider '{body.provider_name}'"},
        )

    if body.base_url:
        try:
            body.base_url = _validate_base_url(body.base_url)
        except ValueError as e:
            raise HTTPException(status_code=400, detail={"code": "VALIDATION_ERROR", "message": str(e)})

    is_valid = await verify_api_key(body.provider_name, body.api_key, body.base_url)

    # If valid and provider already exists in DB, mark it as verified
    if is_valid:
        result = await db.execute(
            select(AIProvider).where(
                AIProvider.user_id == current_user.id,
                AIProvider.provider_name == body.provider_name,
            )
        )
        existing = result.scalars().first()
        if existing:
            existing.is_verified = True
            db.add(existing)
            await db.commit()

    return success({"valid": is_valid})
