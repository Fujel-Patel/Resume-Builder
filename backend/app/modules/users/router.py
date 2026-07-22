"""Users router — GET/PATCH/DELETE /me."""

import logging
from typing import Optional

import jwt as pyjwt
from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.config.settings import settings
from app.modules.users import models as user_models
from app.modules.users import schemas, service
from app.types.common import success
from app.utils.auth import get_current_user
from app.utils.cache import invalidate_user

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/me")
async def get_me(current_user: user_models.User = Depends(get_current_user)):
    return success(schemas.UserResponse.model_validate(current_user).model_dump())


@router.get("/debug/jwt")
async def debug_jwt(authorization: Optional[str] = Header(default=None)):
    """Temporary endpoint — remove after debugging JWT issues."""
    if not authorization or not authorization.startswith("Bearer "):
        return {"has_token": False, "secret_len": len(settings.SUPABASE_JWT_SECRET)}

    token = authorization.removeprefix("Bearer ")
    secret = settings.SUPABASE_JWT_SECRET

    result: dict = {
        "has_token": True,
        "token_len": len(token),
        "secret_len": len(secret),
    }

    try:
        unverified = pyjwt.decode(token, options={"verify_signature": False})
        result["sub"] = unverified.get("sub")
        result["email"] = unverified.get("email")
        result["aud"] = unverified.get("aud")
        result["iss"] = unverified.get("iss")
        result["exp"] = unverified.get("exp")
        result["role"] = unverified.get("role")
    except Exception as e:
        result["unverified_error"] = str(e)

    try:
        verified = pyjwt.decode(token, secret, algorithms=["HS256"], audience="authenticated")
        result["verified"] = True
        result["verified_sub"] = verified.get("sub")
    except pyjwt.ExpiredSignatureError:
        result["verified"] = False
        result["error"] = "EXPIRED"
    except pyjwt.InvalidAudienceError:
        result["verified"] = False
        result["error"] = "INVALID_AUDIENCE"
    except pyjwt.InvalidSignatureError:
        result["verified"] = False
        result["error"] = "INVALID_SIGNATURE"
    except pyjwt.DecodeError as e:
        result["verified"] = False
        result["error"] = f"DECODE_ERROR: {e}"
    except pyjwt.InvalidTokenError as e:
        result["verified"] = False
        result["error"] = f"INVALID_TOKEN: {type(e).__name__}: {e}"

    return result


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
