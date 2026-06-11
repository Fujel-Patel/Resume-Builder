"""
Placeholder router for AI provider settings (CRUD).
This satisfies the import in main.py. Full implementation can be added later.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.modules.users import models as user_models
from app.utils.jwt import verify_access_token

router = APIRouter(
    prefix="/settings/ai",
    tags=["ai-settings"],
    responses={404: {"description": "Not found"}},
)

# Reuse OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
) -> user_models.User:
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
        import uuid

        user_id = uuid.UUID(user_id_str)
    except Exception:
        raise credentials_exception
    from app.modules.users import service as user_service

    user = await user_service.get_user_by_id(db, user_id)
    if user is None:
        raise credentials_exception
    return user


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
