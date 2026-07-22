"""User service — CRUD for user profiles."""

import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.users import models, schemas


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> Optional[models.User]:
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    return result.scalars().first()


async def update_user(
    db: AsyncSession, user_id: uuid.UUID, user_update: schemas.UserUpdate
) -> Optional[models.User]:
    user = await get_user_by_id(db, user_id)
    if not user:
        return None
    for field, value in user_update.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def create_user(
    db: AsyncSession, user_id: uuid.UUID, name: str, email: str
) -> models.User:
    user = models.User(id=user_id, name=name, email=email)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def delete_user(db: AsyncSession, user_id: uuid.UUID) -> bool:
    user = await get_user_by_id(db, user_id)
    if not user:
        return False
    await db.delete(user)
    await db.commit()
    return True
