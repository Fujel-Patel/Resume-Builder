"""
AI Prompts for Resume Generation
Following PRD specification for structured prompts
"""


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