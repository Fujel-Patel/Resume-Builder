from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
import uuid


async def assert_ownership(
    db: AsyncSession,
    model,
    item_id: uuid.UUID,
    user_id: uuid.UUID
):
    """
    Assert that a resource belongs to a user
    Following instruction.md: assertOwnership() helper — always 404 never 403 on wrong user
    """
    query = select(model).where(
        model.id == item_id,
        model.user_id == user_id
    )
    result = await db.execute(query)
    item = result.scalars().first()

    if not item:
        # Always return 404, never 403 to avoid confirming resource existence
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    return item