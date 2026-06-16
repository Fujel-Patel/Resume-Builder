"""
NVIDIA NIM provider implementation (OpenAI‑compatible).

The NIM server expects the same request shape as the OpenAI Chat Completion API.
"""

from typing import Optional

import httpx

# No default endpoint – must be provided via `base_url`


async def complete(
    *,
    prompt: str,
    api_key: str,
    base_url: Optional[str] = None,
    max_tokens: int = 1024,
    model: str = "gpt-4o-mini",
    **kwargs,
) -> str:
    """Call an NVIDIA NIM (OpenAI‑compatible) endpoint.

    Parameters
    ----------
    prompt: str
        The user prompt.
    api_key: str
        API key for the NIM service.
    base_url: Optional[str]
        Base URL of the NIM server (e.g., ``https://your-nim.example.com/v1``).
        This is required – an empty string will raise ``ValueError``.
    max_tokens: int
        Maximum tokens to generate.
    model: str
        Model name to request (default ``gpt-4o-mini`` – can be overridden).
    **kwargs: Any
        Ignored – kept for a uniform signature.
    """
    if not base_url:
        raise ValueError("NVIDIA NIM provider requires a base_url")

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
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        # OpenAI returns choices[0].message.content
        choices = data.get("choices", [])
        if choices:
            message = choices[0].get("message", {})
            return message.get("content", "")
        return ""
