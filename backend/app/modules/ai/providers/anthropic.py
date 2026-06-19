"""
Anthropic provider implementation.

Uses the Claude `messages` endpoint. Supports optional `model` and `max_tokens` parameters.
"""

from typing import Optional

import httpx

# Default endpoint – can be overridden via `base_url` for custom deployments
DEFAULT_ENDPOINT = "https://api.anthropic.com/v1/messages"


async def complete(
    *,
    prompt: str,
    api_key: str,
    base_url: Optional[str] = None,
    max_tokens: int = 1024,
    model: str = "claude-3-5-sonnet-20241022",
    **kwargs,
) -> str:
    """Call Anthropic's `messages` API.

    Parameters
    ----------
    prompt: str
        The user prompt to send to the model.
    api_key: str
        Anthropic API key.
    base_url: Optional[str]
        Custom endpoint (e.g., self‑hosted Anthropic). If omitted, the official API URL is used.
    max_tokens: int
        Maximum tokens for the response.
    model: str
        Model identifier (default is the latest Sonnet model).
    **kwargs: Any
        Additional arguments are ignored – kept for a uniform signature across providers.
    """
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
    async with httpx.AsyncClient(timeout=300) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        # Anthropic returns a list of content blocks under "content"
        # Each block is a dict like {"type": "text", "text": "..."}
        for block in data.get("content", []):
            if block.get("type") == "text":
                return block.get("text", "")
        # Fallback – some older responses used "completion"
        return data.get("completion", "")
