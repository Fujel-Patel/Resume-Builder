"""
AI Service Module
Following instruction.md best practices for AI integration layer
"""
from typing import Optional, Dict, Any
import json
from app.config.database import get_db
from app.modules.ai_providers import models as ai_provider_models
from app.modules.ai_providers import service as ai_provider_service
from app.utils.encryption import decrypt_data
from app.modules.ai.providers import anthropic, gemini, nvidia_nim


# Provider mapping following PRD specification
PROVIDER_MAP = {
    "anthropic": anthropic.complete,
    "gemini": gemini.complete,
    "nvidia-nim": nvidia_nim.complete,
    "custom": anthropic.complete,  # OpenAI-compatible as per PRD
}


async def get_default_provider(user_id: str, db) -> ai_provider_models.AIProvider:
    """
    Get user's default AI provider
    Following PRD: Provider selected from user's saved AI settings
    """
    from app.modules.ai_providers import service as ai_provider_service

    provider = await ai_provider_service.get_default_provider(db, uuid.UUID(user_id))
    if not provider:
        raise ValueError("No default AI provider configured")
    return provider


async def ai_complete(
    user_id: str,
    prompt: str,
    db,
    max_tokens: Optional[int] = None,
    temperature: float = 0.7,
) -> str:
    """
    Complete AI request using user's default provider
    Following PRD: Provider routing logic
    """
    # Get user's default provider
    provider = await get_default_provider(user_id, db)

    # Decrypt API key
    api_key = decrypt_data(provider.api_key_encrypted)
    base_url = provider.base_url  # for custom/nvidia providers

    # Get provider function
    fn = PROVIDER_MAP[provider.provider_name]

    # Call provider
    return await fn(
        prompt=prompt,
        api_key=api_key,
        base_url=base_url,
        max_tokens=max_tokens,
        temperature=temperature
    )


async def verify_api_key(
    provider_name: str,
    api_key: str,
    base_url: Optional[str] = None
) -> bool:
    """
    Verify API key with provider
    Following PRD: Click "Verify" → backend pings provider with minimal test call
    """
    try:
        fn = PROVIDER_MAP[provider_name]
        result = await fn(
            prompt="Reply with just: OK",
            api_key=api_key,
            base_url=base_url,
            max_tokens=5
        )
        return bool(result)
    except Exception:
        return False


# Structured prompts following PRD specification
SUMMARY_PROMPT = """
You are a professional resume writer. Given the user's job title, skills,
experience, and target job description, write a compelling 3-4 sentence
professional summary. Be specific, use active voice, and include relevant keywords.
Return ONLY the summary text, no extra commentary.
"""

SKILLS_PROMPT = """
Given this job description and the user's current skills, suggest
8-12 relevant technical and soft skills the user should highlight.
Return ONLY a JSON array of strings: ["skill1", "skill2", ...]
"""

EXPERIENCE_PROMPT = """
Improve these experience bullet points for the given job role.
Use strong action verbs, add quantifiable impact where logical,
and align with the job description keywords.
Return ONLY a JSON array of improved bullet strings.
"""

PROJECTS_PROMPT = """
Improve these project descriptions for the given job role.
Focus on relevance, impact, and technical details that align with
the job description requirements.
Return ONLY a JSON array of improved description strings.
"""

ATS_SCORE_PROMPT = """
You are an ATS (Applicant Tracking System) expert. Analyze this resume against
the job description. Return ONLY valid JSON with this exact structure:
{
  "overall_score": <0-100>,
  "section_scores": {
    "format": <0-100>,
    "keywords": <0-100>,
    "readability": <0-100>,
    "completeness": <0-100>
  },
  "missing_keywords": ["keyword1", "keyword2"],
  "suggestions": ["suggestion1", " suggestion2"]
}
"""