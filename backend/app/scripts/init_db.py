"""Create all tables from SQLAlchemy models.

Usage:
    python -m app.scripts.init_db          # run as module from backend/

In production this is a no-op — use Alembic migrations instead.
"""

import asyncio

from loguru import logger
from sqlalchemy import text

from app.config.database import Base, engine

# Import ALL models so Base.metadata knows about every table
import app.modules.users.models  # noqa: F401
import app.modules.resumes.models  # noqa: F401
import app.modules.ats.models  # noqa: F401
import app.modules.ai.models  # noqa: F401


async def create_tables():
    """Connect to DB, create all tables defined in models, then close."""
    logger.info("Connecting to database...")
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))

    logger.info("Creating tables from models...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    logger.info("All tables created successfully")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(create_tables())
