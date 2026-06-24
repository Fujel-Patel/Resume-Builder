"""
Anthropic provider implementation.

Uses the Claude `messages` endpoint. Supports optional `model` and `max_tokens` parameters.
"""

from typing import Optional

from app.utils.http_client import get_client


DEFAULT_ENDPOINT = "https://api.anthropic.com/v1/messages"


async def complete(
    *,
    prompt: str,
    api_key: str,
    base_url: Optional[str] = None,
    max_tokens: int = 1024,
    model: str = "claude-3-5-sonnet-20241022",
    json_mode: bool = False,
    **kwargs,
) -> str:
    url = base_url or DEFAULT_ENDPOINT
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "max_tokens": max_tokens,
        "messages": [{"role": "user", "content": prompt}],
    }
    if json_mode:
        payload["system"] = "You must respond with valid JSON only. No other text, no explanation."
    client = get_client()
    response = await client.post(url, headers=headers, json=payload)
    response.raise_for_status()
    data = response.json()
    for block in data.get("content", []):
        if block.get("type") == "text":
            return block.get("text", "")
    return data.get("completion", "")
