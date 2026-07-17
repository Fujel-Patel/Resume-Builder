"""
NVIDIA NIM provider implementation (OpenAI‑compatible).

The NIM server expects the same request shape as the OpenAI Chat Completion API.
"""

from typing import Optional

# No default endpoint – must be provided via `base_url`


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
    json_mode: bool
        If True, request structured JSON output via ``response_format``.
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
    if json_mode:
        payload["response_format"] = {"type": "json_object"}
    from app.utils.http_client import get_client
    client = get_client()
    response = await client.post(url, headers=headers, json=payload, timeout=120)
    response.raise_for_status()
    data = response.json()
    choices = data.get("choices", [])
    if choices:
        message = choices[0].get("message", {})
        return message.get("content", "")
    return ""
