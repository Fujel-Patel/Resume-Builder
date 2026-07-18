"""Users router — GET/PATCH/DELETE /me."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.modules.users import models as user_models
from app.modules.users import schemas, service
from app.types.common import success
from app.utils.auth import get_current_user
from app.utils.cache import invalidate_user

router = APIRouter()


@router.get("/me")
async def get_me(current_user: user_models.User = Depends(get_current_user)):
    return success(schemas.UserResponse.model_validate(current_user).model_dump())


@router.patch("/me")
async def update_me(
    body: schemas.UserUpdate,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updated = await service.update_user(db, current_user.id, body)  # type: ignore[arg-type]
    if not updated:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "User not found"})
    invalidate_user(str(current_user.id))
    return success(schemas.UserResponse.model_validate(updated).model_dump())


@router.delete("/me", status_code=status.HTTP_200_OK)
async def delete_me(
    body: schemas.DeleteAccountRequest,
    current_user: user_models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Requires body: { "confirmation": "DELETE MY ACCOUNT" } per PRD."""
    # Delete from Supabase Auth
    try:
        from app.config.settings import settings
        from supabase import create_client
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        supabase.auth.admin.delete_user(str(current_user.id))
    except Exception:
        pass  # Best effort — profile delete below is the critical part

    deleted = await service.delete_user(db, current_user.id)  # type: ignore[arg-type]
    if not deleted:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "User not found"})
    return success({"message": "Account deleted successfully"})
