"""
Google Gemini provider implementation.

Uses the Gemini `generateContent` endpoint. Accepts an API key via query parameter.
"""

from typing import Optional

from app.utils.http_client import get_client


DEFAULT_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"


async def complete(
    *,
    prompt: str,
    api_key: str,
    base_url: Optional[str] = None,
    max_tokens: int = 1024,
    model: str = "gemini-2.0-flash",
    json_mode: bool = False,
    **kwargs,
) -> str:
    if base_url:
        url = base_url
    else:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

    params = {"key": api_key}

    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"maxOutputTokens": max_tokens},
    }
    if json_mode:
        payload["generationConfig"]["response_mime_type"] = "application/json"

    client = get_client()
    response = await client.post(url, params=params, json=payload)
    response.raise_for_status()
    data = response.json()
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
    url = f"{base_url or GEMINI_API_BASE}/models"
    params = {"key": api_key}

    client = get_client()
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
