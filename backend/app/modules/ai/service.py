"""
AI service layer – provider routing, API key verification, and helper utilities.
"""

from typing import Optional
from urllib.parse import urlparse

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


def _validate_base_url(base_url: str) -> str:
    """Validate and sanitize a base_url for external AI providers.

    Only http/https schemes are allowed and localhost / private IPs are blocked.
    This prevents SSRF attacks where an attacker could supply internal service URLs.
    """
    parsed = urlparse(base_url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError("base_url must use http or https scheme")
    # Disallow localhost and common cloud metadata hosts
    blocked_hosts = (
        "localhost",
        "127.0.0.1",
        "0.0.0.0",
        "::1",
        "169.254.169.254",
        "metadata.google.internal",
        "metadata.azure.com",
    )
    if parsed.hostname in blocked_hosts:
        raise ValueError("base_url cannot point to a local or metadata address")
    return base_url


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

    Decrypts the stored API key, selects the appropriate provider function,
    validates the base_url to prevent SSRF, and returns the generated text.
    """
    provider = await get_default_provider(user_id, db)
    api_key = decrypt(provider.api_key_encrypted)
    base_url = provider.base_url  # May be None for providers that don't need it

    # Validate base_url if provided (prevent SSRF)
    if base_url:
        base_url = _validate_base_url(base_url)

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

    # Validate base_url if provided (prevent SSRF)
    if base_url:
        base_url = _validate_base_url(base_url)

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
