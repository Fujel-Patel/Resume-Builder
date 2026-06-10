"""
NVIDIA NIM AI Provider Integration
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
    Complete a prompt using NVIDIA NIM's API
    """
    url = base_url or "https://integrate.api.nvidia.com/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    data = {
        "model": "nemotron-3-super-120b-a12b",  # Using the model specified in the environment
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
        if "choices" in result and len(result["choices"]) > 0:
            return result["choices"][0]["message"]["content"]
        else:
            raise ValueError("Unexpected response format from NVIDIA NIM API")