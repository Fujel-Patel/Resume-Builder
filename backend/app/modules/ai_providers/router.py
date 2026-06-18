"""AI provider settings — full CRUD with verify + list-models flow."""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.modules.ai.models import AIProvider
from app.modules.ai.providers.openai_compatible import PROVIDER_DEFAULTS
from app.modules.ai.service import (
    _validate_base_url,
    list_provider_models,
    verify_api_key,
)
from app.modules.users import models as user_models
from app.types.common import success
from app.utils.auth import get_current_user
from app.utils.encryption import decrypt, encrypt

router = APIRouter()

VALID_PROVIDERS = {"gemini", "openrouter", "groq", "custom", "nvidia-nim", "nvidia"}

# Providers where base_url is required (no default)
BASE_URL_REQUIRED = {"custom", "nvidia-nim", "nvidia"}

# Normalize user-facing names to internal names
PROVIDER_ALIASES = {"nvidia": "nvidia-nim"}


def _get_default_base_url(provider_name: str) -> Optional[str]:
    return PROVIDER_DEFAULTS.get(provider_name)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class AIProviderCreate(BaseModel):
    provider_name: str = Field(
        ..., description="gemini | openrouter | groq | custom | nvidia-nim"
    )
    api_key: str = Field(..., min_length=1)
    base_url: Optional[str] = None
    model: Optional[str] = None
    is_default: bool = False

    model_config = ConfigDict(str_strip_whitespace=True)


class AIProviderUpdate(BaseModel):
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    model: Optional[str] = None
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
    base_url: Optional[str] = None
    model: Optional[str] = None
    is_default: bool
    is_verified: bool

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _normalize_provider(name: str) -> str:
    return PROVIDER_ALIASES.get(name, name)


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
            AIProvider.user_id == user_id,
        )
    )
    provider = result.scalars().first()
    if not provider:
        raise _not_found()
    return provider


async def _clear_default(db: AsyncSession, user_id: uuid.UUID) -> None:
    result = await db.execute(
        select(AIProvider).where(
            AIProvider.user_id == user_id, AIProvider.is_default.is_(True)
        )
    )
    for p in result.scalars().all():
        p.is_default = False
        db.add(p)


def _resolve_base_url(provider_name: str, base_url: Optional[str]) -> str:
    """Return the effective base_url — use default if provider has one."""
    if base_url:
        return _validate_base_url(base_url)
    default = _get_default_base_url(provider_name)
    if default:
        return default
    raise HTTPException(
        status_code=400,
        detail={
            "code": "VALIDATION_ERROR",
            "message": f"base_url is required for provider '{provider_name}'",
        },
    )


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
    return success(
        [AIProviderResponse.model_validate(p).model_dump() for p in providers]
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def add_provider(
    body: AIProviderCreate,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    body.provider_name = _normalize_provider(body.provider_name)

    if body.provider_name not in VALID_PROVIDERS:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "VALIDATION_ERROR",
                "message": f"provider_name must be one of {VALID_PROVIDERS}",
            },
        )

    if body.base_url:
        try:
            body.base_url = _validate_base_url(body.base_url)
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail={"code": "VALIDATION_ERROR", "message": str(e)},
            )
    elif body.provider_name in BASE_URL_REQUIRED:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "VALIDATION_ERROR",
                "message": f"base_url is required for provider '{body.provider_name}'",
            },
        )

    existing = await db.execute(
        select(AIProvider).where(
            AIProvider.user_id == current_user.id,
            AIProvider.provider_name == body.provider_name,
        )
    )
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "CONFLICT",
                "message": f"Provider '{body.provider_name}' already configured. Use PATCH to update.",
            },
        )

    if body.is_default:
        await _clear_default(db, current_user.id)

    provider = AIProvider(
        user_id=current_user.id,
        provider_name=body.provider_name,
        api_key_encrypted=encrypt(body.api_key),
        base_url=body.base_url,
        model=body.model,
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
            provider.base_url = (
                _validate_base_url(body.base_url) if body.base_url else None
            )
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail={"code": "VALIDATION_ERROR", "message": str(e)},
            )

    if body.api_key is not None:
        provider.api_key_encrypted = encrypt(body.api_key)
        provider.is_verified = False

    if body.model is not None:
        provider.model = body.model

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


@router.get("/{provider_id}/models")
async def list_models(
    provider_id: uuid.UUID,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    provider = await _get_provider(db, provider_id, current_user.id)
    api_key = decrypt(provider.api_key_encrypted)
    models = await list_provider_models(
        provider_name=provider.provider_name,
        api_key=api_key,
        base_url=provider.base_url,
    )
    return success(models)


@router.post("/verify")
async def verify_provider(
    body: AIProviderVerifyRequest,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    body.provider_name = _normalize_provider(body.provider_name)

    if body.provider_name not in VALID_PROVIDERS:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "VALIDATION_ERROR",
                "message": f"Unknown provider '{body.provider_name}'",
            },
        )

    if body.base_url:
        try:
            body.base_url = _validate_base_url(body.base_url)
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail={"code": "VALIDATION_ERROR", "message": str(e)},
            )

    is_valid, error_msg, models = await verify_api_key(
        body.provider_name, body.api_key, body.base_url
    )

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

    data = {"valid": is_valid}

    if is_valid:
        data["models"] = models

    if error_msg:
        data["error"] = error_msg

    return success(data)
