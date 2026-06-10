from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import Optional
from app.modules.users import models, schemas
from app.config.database import get_db


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[models.User]:
    """Get user by email"""
    query = select(models.User).where(models.User.email == email)
    result = await db.execute(query)
    return result.scalars().first()


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> Optional[models.User]:
    """Get user by ID"""
    query = select(models.User).where(models.User.id == user_id)
    result = await db.execute(query)
    return result.scalars().first()


async def update_user(
    db: AsyncSession, user_id: uuid.UUID, user_update: schemas.UserUpdate
) -> Optional[models.User]:
    """Update user information"""
    user = await get_user_by_id(db, user_id)
    if not user:
        return None

    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def delete_user(db: AsyncSession, user_id: uuid.UUID) -> bool:
    """Delete user"""
    user = await get_user_by_id(db, user_id)
    if not user:
        return False

    await db.delete(user)
    await db.commit()
    return True