"""
System prompts for AI tasks (as defined in the PRD).
These prompts are intended to be passed directly to the LLM provider services.
"""

# Professional summary prompt
SUMMARY_PROMPT = """
You are a professional resume writer. Given the user's job title, skills,
experience, and target job description, write a compelling 3-4 sentence
professional summary. Be specific, use active voice, and include relevant keywords.
Return ONLY the summary text, no extra commentary.
"""

# Skills suggestion prompt
SKILLS_PROMPT = """
Given this job description and the user's current skills, suggest
8-12 relevant technical and soft skills the user should highlight.
Return ONLY a JSON array of strings: ["skill1", "skill2", ...]
"""

# Experience improvement prompt
EXPERIENCE_PROMPT = """
Improve these experience bullet points for the given job role.
Use strong action verbs, add quantifiable impact where logical,
and align with the job description keywords.
Return ONLY a JSON array of improved bullet strings.
"""

# ATS scoring prompt
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
  "suggestions": ["suggestion1", "suggestion2"]
}
"""
