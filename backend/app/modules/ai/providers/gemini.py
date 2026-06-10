"""
Google Gemini AI Provider Integration
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
    Complete a prompt using Google Gemini's API
    """
    url = base_url or f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"

    headers = {
        "Content-Type": "application/json",
    }

    data = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "maxOutputTokens": max_tokens,
            "temperature": temperature,
            "topP": 0.8,
            "topK": 10
        }
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=data, timeout=30.0)
        response.raise_for_status()
        result = response.json()

        # Extract text from response
        if "candidates" in result and len(result["candidates"]) > 0:
            candidate = result["candidates"][0]
            if "content" in candidate and "parts" in candidate["content"]:
                parts = candidate["content"]["parts"]
                if len(parts) > 0 and "text" in parts[0]:
                    return parts[0]["text"]

        raise ValueError("Unexpected response format from Gemini API")