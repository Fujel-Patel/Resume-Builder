"""
OpenAI-compatible provider implementation.

Used by: OpenRouter, Groq, custom OpenAI-compatible endpoints, and Nvidia NIM.
All follow the OpenAI Chat Completion API format.
"""

from typing import Optional

from app.utils.http_client import get_client


OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
GROQ_BASE_URL = "https://api.groq.com/openai/v1"

PROVIDER_DEFAULTS = {
    "openrouter": OPENROUTER_BASE_URL,
    "groq": GROQ_BASE_URL,
    "custom": None,
    "nvidia-nim": "https://integrate.api.nvidia.com/v1",
    "nvidia": "https://integrate.api.nvidia.com/v1",
}


async def complete(
    *,
    prompt: str,
    api_key: str,
    base_url: Optional[str] = None,
    max_tokens: int = 1024,
    model: str = "gpt-4o-mini",
    json_mode: bool = False,
    **kwargs,
) -> str:
    if not base_url:
        raise ValueError("OpenAI-compatible provider requires a base_url")

    url = f"{base_url.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}
    client = get_client()
    response = await client.post(url, headers=headers, json=payload)
    response.raise_for_status()
    data = response.json()
    choices = data.get("choices", [])
    if choices:
        message = choices[0].get("message", {})
        return message.get("content", "")
    return ""


async def list_models(
    *,
    api_key: str,
    base_url: Optional[str] = None,
) -> list[dict]:
    if not base_url:
        return []

    url = f"{base_url.rstrip('/')}/models"
    headers = {"Authorization": f"Bearer {api_key}"}

    client = get_client()
    response = await client.get(url, headers=headers)
    response.raise_for_status()
    data = response.json()

    raw = data.get("data", [])
    return [{"id": m["id"], "name": m.get("id", m["id"])} for m in raw]
