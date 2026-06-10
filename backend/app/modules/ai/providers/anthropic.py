"""
Anthropic AI Provider Integration
"""
import httpx
import json
from typing import Optional


async def complete(
    prompt: str,
    api_key: str,
    base_url: Optional[str] = None,
    max_tokens: int = 1000,
    temperature: float = 0.7,
) -> str:
    """
    Complete a prompt using Anthropic's API
    """
    url = base_url or "https://api.anthropic.com/v1/messages"

    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    data = {
        "model": "claude-3-sonnet-20240229",  # Using a stable model version
        "max_tokens": max_tokens,
        "temperature": temperature,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=data, timeout=30.0)
        response.raise_for_status()
        result = response.json()

        # Extract text from response
        if "content" in result and len(result["content"]) > 0:
            return result["content"][0]["text"]
        else:
            raise ValueError("Unexpected response format from Anthropic API")