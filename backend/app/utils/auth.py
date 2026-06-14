"""Shared get_current_user dependency — pyjwt only (no python-jose)."""

import uuid
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.modules.users import models as user_models
from app.modules.users import service as user_service
from app.utils.jwt import verify_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

_401 = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail={"code": "UNAUTHORIZED", "message": "Could not validate credentials"},
    headers={"WWW-Authenticate": "Bearer"},
)

_401_expired = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail={"code": "TOKEN_EXPIRED", "message": "Access token expired"},
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> user_models.User:
    payload = verify_access_token(token)
    if payload is None:
        raise _401

    user_id_str: Optional[str] = payload.get("sub")
    if not user_id_str:
        raise _401

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise _401

    user = await user_service.get_user_by_id(db, user_id)
    if user is None or not user.is_active:
        raise _401

    return user
