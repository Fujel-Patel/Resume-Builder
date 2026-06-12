"""
Placeholder router for AI provider settings (CRUD).
This satisfies the import in main.py. Full implementation can be added later.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.modules.users import models as user_models
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/settings/ai",
    tags=["ai-settings"],
    responses={404: {"description": "Not found"}},
)


# Placeholder endpoints – return NotImplementedError
@router.get("/", response_model=dict)
async def list_providers(
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    raise NotImplementedError("List AI providers endpoint not implemented yet")


@router.post("/", response_model=dict)
async def add_provider(
    provider: dict,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    raise NotImplementedError("Add AI provider endpoint not implemented yet")


@router.patch("/{provider_id}", response_model=dict)
async def update_provider(
    provider_id: str,
    update: dict,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    raise NotImplementedError("Update AI provider endpoint not implemented yet")


@router.delete("/{provider_id}", response_model=dict)
async def delete_provider(
    provider_id: str,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    raise NotImplementedError("Delete AI provider endpoint not implemented yet")


@router.post("/verify", response_model=dict)
async def verify_provider(
    provider: dict,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    raise NotImplementedError("Verify AI provider endpoint not implemented yet")
