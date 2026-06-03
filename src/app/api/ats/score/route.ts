import { NextResponse } from "next/server";
import { scoreResume } from "@/lib/ats";
import { z } from "zod";

// Extend the library's return type to include AI-generated suggestions
interface AtsScoreResponse {
  score: number;
  breakdown: {
    keywordScore: number;
    skillScore: number;
    experienceScore: number;
    educationScore: number;
    formatScore: number;
  };
  suggestions: string[];
}

const scoreRequestSchema = z.object({
  resumeText: z.string().min(50).max(20000),
  jobDescription: z.string().min(50).max(20000),
  resumeSkills: z.array(z.string()).optional(),
  jobRequiredSkills: z.array(z.string()).optional(),
  jobPreferredSkills: z.array(z.string()).optional(),
  minYearsExperience: z.number().optional(),
  educationLevel: z.string().optional(),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = scoreRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      resumeText,
      jobDescription,
      resumeSkills = [],
      jobRequiredSkills = [],
      jobPreferredSkills = [],
      minYearsExperience,
      educationLevel,
    } = parsed.data;

    const result = scoreResume(
      { rawText: resumeText, skills: resumeSkills },
      {
        rawText: jobDescription,
        requiredSkills: jobRequiredSkills,
        preferredSkills: jobPreferredSkills,
        minYearsExperience,
        educationLevel,
      }
    );

    // Enhance with human-readable suggestions
    const suggestions = buildSuggestions(
      result,
      resumeText,
      jobRequiredSkills,
      jobPreferredSkills
    );

    const response: AtsScoreResponse = {
      score: result.score,
      breakdown: result.breakdown,
      suggestions,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("ATS scoring error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function buildSuggestions(
  result: { score: number; breakdown: Record<string, number> },
  resumeText: string,
  required: string[],
  preferred: string[]
): string[] {
  const tips: string[] = [];
  const lowerResume = resumeText.toLowerCase();

  if (result.breakdown.keywordScore < 50) {
    tips.push("Keyword match is low. Add more keywords from the job description to your resume sections.");
  }
  if (result.breakdown.skillScore < 50) {
    const missing = required.filter((s) => !lowerResume.includes(s.toLowerCase()));
    if (missing.length > 0) {
      tips.push(`Add these required skills: ${missing.slice(0, 5).join(", ")}.`);
    }
  }
  if (result.breakdown.experienceScore < 50) {
    tips.push("Include more quantifiable achievements and years of experience in your resume.");
  }
  if (result.breakdown.educationScore < 50) {
    tips.push("Add education details prominently — degree, institution, and graduation year.");
  }
  if (result.breakdown.formatScore < 50) {
    if (!/contact/i.test(resumeText)) tips.push("Add a contact section (name, email, phone).");
    if (!/experience/i.test(resumeText)) tips.push("Add an experience section listing roles and companies.");
    if (!/education/i.test(resumeText)) tips.push("Add an education section.");
    if (!/skills/i.test(resumeText)) tips.push("Add a dedicated skills section.");
  }
  if (result.score >= 80) {
    tips.push("Good score! Your resume closely matches the job description.");
  }
  const missingPreferred = preferred.filter(
    (s) => !lowerResume.includes(s.toLowerCase())
  );
  if (missingPreferred.length > 0) {
    tips.push(
      `Nice-to-have skills not found: ${missingPreferred.slice(0, 3).join(", ")}.`
    );
  }
  if (tips.length === 0) {
    tips.push("Review your resume for alignment with the job description and add relevant keywords.");
  }
  return tips;
}