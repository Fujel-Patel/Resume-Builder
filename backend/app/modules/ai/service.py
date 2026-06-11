"""
AI service layer – provider routing, API key verification, and helper utilities.
"""

from typing import List, Optional

import httpx
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.ai.models import AIProvider

# Import provider implementations
from app.modules.ai.providers import anthropic, gemini, nvidia_nim
from app.utils.encryption import decrypt

# Mapping of provider identifiers to callable functions
PROVIDER_MAP = {
    "anthropic": anthropic.complete,
    "gemini": gemini.complete,
    "nvidia-nim": nvidia_nim.complete,
    "custom": anthropic.complete,  # treat custom as OpenAI‑compatible (use anthropic placeholder)
}


async def get_default_provider(user_id: str, db: AsyncSession) -> AIProvider:
    """Return the default AIProvider for the user.

    If none is marked as default, return the first provider for the user.
    Raises HTTPException(404) if the user has no providers configured.
    """
    # Try default first
    stmt = select(AIProvider).where(
        AIProvider.user_id == user_id, AIProvider.is_default.is_(True)
    )
    result = await db.execute(stmt)
    provider = result.scalars().first()
    if provider:
        return provider
    # Fallback to any provider
    stmt = select(AIProvider).where(AIProvider.user_id == user_id)
    result = await db.execute(stmt)
    provider = result.scalars().first()
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No AI provider configured for user",
        )
    return provider


async def get_provider_by_name(
    user_id: str, provider_name: str, db: AsyncSession
) -> Optional[AIProvider]:
    """Fetch a specific provider by name for the given user."""
    stmt = select(AIProvider).where(
        AIProvider.user_id == user_id, AIProvider.provider_name == provider_name
    )
    result = await db.execute(stmt)
    return result.scalars().first()


async def ai_complete(user_id: str, prompt: str, db: AsyncSession) -> str:
    """Route a prompt to the user's default AI provider.

    Decrypts the stored API key, selects the appropriate provider function, and returns the generated text.
    """
    provider = await get_default_provider(user_id, db)
    api_key = decrypt(provider.api_key_encrypted)
    base_url = provider.base_url  # May be None for providers that don't need it
    fn = PROVIDER_MAP.get(provider.provider_name)
    if not fn:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported AI provider"
        )
    return await fn(prompt=prompt, api_key=api_key, base_url=base_url)


async def verify_api_key(
    provider_name: str, api_key: str, base_url: Optional[str] = None
) -> bool:
    """Validate an API key for a given provider by performing a cheap test call.

    Returns ``True`` if the provider responds successfully, ``False`` otherwise.
    """
    fn = PROVIDER_MAP.get(provider_name)
    if not fn:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported provider for verification",
        )
    try:
        # Small prompt to verify connectivity; limit tokens to keep it cheap.
        result = await fn(
            prompt="Reply with just: OK",
            api_key=api_key,
            base_url=base_url,
            max_tokens=5,
        )
        # Some providers may return the literal "OK" or a JSON; we just check truthiness.
        return bool(result)
    except Exception as exc:
        # Log the exception for debugging (omitted here to avoid import cycles)
        return False
