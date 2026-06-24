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

from app.modules.ai.providers import anthropic, gemini, openai_compatible
from app.utils.encryption import decrypt
from app.utils.metrics import AIRequestMetrics, Timer, log_ai_metrics

PROVIDER_MAP = {
    "anthropic": anthropic.complete,
    "gemini": gemini.complete,
    "nvidia-nim": openai_compatible.complete,
    "nvidia": openai_compatible.complete,
    "openrouter": openai_compatible.complete,
    "groq": openai_compatible.complete,
    "custom": openai_compatible.complete,
}

LIST_MODELS_MAP = {
    "gemini": gemini.list_models,
    "nvidia-nim": openai_compatible.list_models,
    "nvidia": openai_compatible.list_models,
    "openrouter": openai_compatible.list_models,
    "groq": openai_compatible.list_models,
    "custom": openai_compatible.list_models,
}


def _validate_base_url(base_url: str) -> str:
    parsed = urlparse(base_url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError("base_url must use http or https scheme")
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
    stmt = select(AIProvider).where(
        AIProvider.user_id == user_id, AIProvider.is_default.is_(True)
    )
    result = await db.execute(stmt)
    provider = result.scalars().first()
    if provider:
        return provider
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
    stmt = select(AIProvider).where(
        AIProvider.user_id == user_id, AIProvider.provider_name == provider_name
    )
    result = await db.execute(stmt)
    return result.scalars().first()


async def ai_complete(
    user_id: str, prompt: str, db: AsyncSession, max_tokens: int = 1024, json_mode: bool = False, endpoint: str = ""
) -> str:
    total_timer = Timer()
    provider = await get_default_provider(user_id, db)
    api_key = decrypt(provider.api_key_encrypted)
    base_url = provider.base_url

    if base_url:
        base_url = _validate_base_url(base_url)

    fn = PROVIDER_MAP.get(provider.provider_name)
    if not fn:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported AI provider"
        )

    ai_timer = Timer()
    try:
        content = await fn(
            prompt=prompt,
            api_key=api_key,
            base_url=base_url,
            model=provider.model or "gpt-4o-mini",
            max_tokens=max_tokens,
            json_mode=json_mode,
        )
    except HTTPException:
        raise
    except Exception as e:
        metrics = AIRequestMetrics(
            provider=provider.provider_name,
            model=provider.model or "",
            ai_latency_ms=ai_timer.elapsed_ms(),
            total_duration_ms=total_timer.elapsed_ms(),
            endpoint=endpoint,
            success=False,
            error=str(e),
        )
        log_ai_metrics(metrics)
        raise

    ai_latency = ai_timer.elapsed_ms()
    total = total_timer.elapsed_ms()

    metrics = AIRequestMetrics(
        provider=provider.provider_name,
        model=provider.model or "",
        ai_latency_ms=ai_latency,
        total_duration_ms=total,
        endpoint=endpoint,
        success=True,
    )
    log_ai_metrics(metrics)

    return content


async def verify_api_key(
    provider_name: str, api_key: str, base_url: Optional[str] = None
) -> tuple[bool, str, list[dict]]:
    if base_url:
        base_url = _validate_base_url(base_url)

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
    fn = LIST_MODELS_MAP.get(provider_name)
    if not fn:
        return []

    try:
        return await fn(api_key=api_key, base_url=base_url)
    except Exception:
        return []
