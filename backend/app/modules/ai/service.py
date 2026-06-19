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
from app.modules.ai.providers import anthropic, gemini, openai_compatible
from app.utils.encryption import decrypt

# Mapping of provider identifiers to callable functions
PROVIDER_MAP = {
    "anthropic": anthropic.complete,
    "gemini": gemini.complete,
    "nvidia-nim": openai_compatible.complete,
    "nvidia": openai_compatible.complete,
    "openrouter": openai_compatible.complete,
    "groq": openai_compatible.complete,
    "custom": openai_compatible.complete,
}

# Mapping of provider identifiers to list_models functions
LIST_MODELS_MAP = {
    "gemini": gemini.list_models,
    "nvidia-nim": openai_compatible.list_models,
    "nvidia": openai_compatible.list_models,
    "openrouter": openai_compatible.list_models,
    "groq": openai_compatible.list_models,
    "custom": openai_compatible.list_models,
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


async def ai_complete(
    user_id: str, prompt: str, db: AsyncSession, max_tokens: int = 1024
) -> str:
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
    return await fn(
        prompt=prompt,
        api_key=api_key,
        base_url=base_url,
        model=provider.model or "gpt-4o-mini",
        max_tokens=max_tokens,
    )


async def verify_api_key(
    provider_name: str, api_key: str, base_url: Optional[str] = None
) -> tuple[bool, str, list[dict]]:
    """Validate an API key and return available models.

    For providers with a ``list_models`` endpoint, uses that to verify
    (no model name needed). Falls back to a chat completion test otherwise.

    Returns ``(True, "", models)`` on success, ``(False, error_msg, [])`` on failure.
    """
    if base_url:
        base_url = _validate_base_url(base_url)

    # Prefer models-list verification (works without a model name)
    list_fn = LIST_MODELS_MAP.get(provider_name)
    if list_fn:
        try:
            models = await list_fn(api_key=api_key, base_url=base_url)
            return True, "", models
        except httpx.HTTPStatusError as exc:
            detail = ""
            try:
                detail = exc.response.json().get("error", {}).get("message", "")
            except Exception:
                detail = exc.response.text[:300]
            return False, f"API returned {exc.response.status_code}: {detail}", []
        except httpx.TimeoutException:
            return False, "Request timed out — check network or base_url", []
        except Exception as exc:
            return False, str(exc), []

    # Fallback to chat completion test (Anthropic)
    fn = PROVIDER_MAP.get(provider_name)
    if not fn:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported provider for verification",
        )

    try:
        result = await fn(
            prompt="Reply with just: OK",
            api_key=api_key,
            base_url=base_url,
            max_tokens=5,
        )
        return bool(result), "", []
    except httpx.HTTPStatusError as exc:
        detail = ""
        try:
            detail = exc.response.json().get("error", {}).get("message", "")
        except Exception:
            detail = exc.response.text[:300]
        return False, f"API returned {exc.response.status_code}: {detail}", []
    except httpx.TimeoutException:
        return False, "Request timed out — check network or base_url", []
    except Exception as exc:
        return False, str(exc), []


async def list_provider_models(
    provider_name: str, api_key: str, base_url: Optional[str] = None
) -> list[dict]:
    """List available models for a given provider.

    Returns a list of ``{id, name}`` dicts, or ``[]`` on error.
    """
    fn = LIST_MODELS_MAP.get(provider_name)
    if not fn:
        return []

    try:
        return await fn(api_key=api_key, base_url=base_url)
    except Exception:
        return []
