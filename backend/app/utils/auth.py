"""Shared authentication utilities for FastAPI routers.

Provides a single ``get_current_user`` dependency used across all protected
routers.  This avoids the maintenance burden of keeping five identical copies
in sync.
"""

import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.modules.users import models as user_models
from app.modules.users import service as user_service
from app.utils.jwt import verify_access_token

# Reuse the same OAuth2 scheme as the auth module
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> user_models.User:
    """Dependency that returns the currently authenticated user.

    Raises HTTPException(401) if the token is missing, invalid, or the user
    no longer exists / is inactive.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = verify_access_token(token)
        if payload is None:
            raise credentials_exception
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = uuid.UUID(user_id_str)
    except JWTError:
        raise credentials_exception

    user = await user_service.get_user_by_id(db, user_id)
    if user is None:
        raise credentials_exception
    return user
