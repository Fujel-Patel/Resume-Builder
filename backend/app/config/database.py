"""Database utilities for the FastAPI backend.

This module creates a global asynchronous SQLAlchemy engine based on the
``DATABASE_URL`` defined in :pymod:`app.config.settings`. It also provides a
session factory and a FastAPI dependency ``get_db`` that yields an
``AsyncSession`` for request handling.
"""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base

from app.config.settings import settings

# Create async engine with production-ready pool settings
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.APP_ENV == "development",
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=1800,  # Recycle connections every 30 min — match Supabase idle timeout
    connect_args={"statement_cache_size": 0},
)

# Create async session factory (SQLAlchemy 2.0 async best practice)
AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Create base class for declarative models
Base = declarative_base()


# Dependency to get async session
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields an async SQLAlchemy session.

    The session is created for each request and closed automatically after
    the request is processed. Using ``async with`` ensures proper cleanup even if
    an exception occurs.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
