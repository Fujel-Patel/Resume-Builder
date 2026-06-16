"""
Google Gemini provider implementation.

Uses the Gemini `generateContent` endpoint. Accepts an API key via query parameter.
"""

from typing import Optional

import httpx

# Default endpoint (public API) – model can be part of the URL
DEFAULT_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"


async def complete(
    *,
    prompt: str,
    api_key: str,
    base_url: Optional[str] = None,
    max_tokens: int = 1024,
    model: str = "gemini-2.0-flash",
    **kwargs,
) -> str:
    """Call Gemini's generateContent API.

    Parameters
    ----------
    prompt: str
        The prompt text.
    api_key: str
        Google API key.
    base_url: Optional[str]
        If provided, replaces the default endpoint. Expected to include the model name.
    max_tokens: int
        Maximum output tokens.
    model: str
        Model identifier (default flash). Ignored if `base_url` already contains a model.
    **kwargs: Any
        Ignored – kept for unified signature.
    """
    # Resolve endpoint
    if base_url:
        url = base_url
    else:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

    # Gemini expects the API key as a query parameter `key`
    params = {"key": api_key}

    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"maxOutputTokens": max_tokens},
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(url, params=params, json=payload)
        response.raise_for_status()
        data = response.json()
        # Extract the text from candidates[0].content.parts[0].text
        candidates = data.get("candidates", [])
        if candidates:
            content = candidates[0].get("content", {})
            parts = content.get("parts", [])
            if parts:
                return parts[0].get("text", "")
        return ""


async def list_models(
    *,
    api_key: str,
    base_url: Optional[str] = None,
) -> list[dict]:
    """List available Gemini models that support ``generateContent``.

    Returns a list of ``{id, name}`` dicts.
    """
    url = f"{base_url or GEMINI_API_BASE}/models"
    params = {"key": api_key}

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    models = []
    for m in data.get("models", []):
        methods = m.get("supportedGenerationMethods", [])
        if "generateContent" in methods:
            model_id = m["name"].replace("models/", "")
            models.append({"id": model_id, "name": m.get("displayName", model_id)})
    return models
