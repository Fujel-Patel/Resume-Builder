import { z } from "zod";
import type { ParsedJD } from "@/types/jd";

export const ParsedJDSchema = z.object({
  title: z.string().optional(),
  company: z.string().optional(),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  experienceLevel: z.string().optional(),
  educationRequirements: z.string().optional(),
  certifications: z.array(z.string()).default([]),
});

export type ParsedJDOutput = z.infer<typeof ParsedJDSchema>;

export function buildJDExtractionPrompt(jobDescription: string): string {
  return `You are an expert recruiter and job analysis AI. Analyze the following job description and extract structured information from it.

Job Description:
\`\`\`
${jobDescription}
\`\`\`

Extract and return ONLY a valid JSON object (no markdown, no extra text) with the following schema:
{
  "title": "Job title if mentioned",
  "company": "Company name if mentioned",
  "requiredSkills": ["List of must-have skills, technologies, tools explicitly required"],
  "preferredSkills": ["List of nice-to-have skills or qualifications"],
  "keywords": ["Important keywords, buzzwords, and industry terms from the JD"],
  "responsibilities": ["Key responsibilities and duties mentioned"],
  "experienceLevel": "e.g., 'Entry-level', 'Mid-level', 'Senior', 'Lead', 'Manager', 'Director', 'VP', 'C-level'",
  "educationRequirements": "Educational requirements if mentioned",
  "certifications": ["Required or preferred certifications"]
}

Rules:
- Return ONLY the JSON object, no additional text or markdown formatting.
- Extract skills as concise terms (e.g., "React", "Python", "AWS", "Agile").
- Include technologies, frameworks, programming languages, tools, methodologies.
- For keywords, include both hard skills and soft skills, industry-specific terms.
- If a field is not found, use an empty array or empty string as appropriate.
- Be thorough but precise - avoid overly generic terms.
- Normalize skill names (e.g., use "JavaScript" not "javascript", "Node.js" not "nodejs").`;
}
