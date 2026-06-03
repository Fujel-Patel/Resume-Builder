// ATS scoring library
// Implements a simple, configurable ATS scoring algorithm.
// Designed to be pure TypeScript (no side‑effects) for easy unit‑testing.

import { TfIdf } from "natural";
import levenshtein from "fast-levenshtein";

/** Configuration for weighting each component. All weights must sum to 1. */
export interface AtsConfig {
  keywordWeight: number; // weight for TF‑IDF similarity
  skillWeight: number; // weight for skill matching
  experienceWeight: number; // weight for experience relevance
  educationWeight: number; // weight for education fit
  formatWeight: number; // weight for resume completeness/format
}

// Default weighting – can be overridden per request.
export const defaultConfig: AtsConfig = {
  keywordWeight: 0.35,
  skillWeight: 0.30,
  experienceWeight: 0.15,
  educationWeight: 0.10,
  formatWeight: 0.10,
};

/** Helper: compute cosine similarity between two TF‑IDF vectors. */
function tfidfCosineSimilarity(resumeText: string, jobText: string): number {
  const tfidf = new TfIdf();
  tfidf.addDocument(resumeText);
  tfidf.addDocument(jobText);
  const resumeVec: number[] = [];
  const jobVec: number[] = [];
  const terms = tfidf.documents[0];
  // Gather all terms from both documents
  const allTerms = new Set<string>([...Object.keys(tfidf.documents[0]), ...Object.keys(tfidf.documents[1])]);
  allTerms.forEach((term) => {
    resumeVec.push(tfidf.tfidf(term, 0));
    jobVec.push(tfidf.tfidf(term, 1));
  });
  const dot = resumeVec.reduce((sum, v, i) => sum + v * jobVec[i], 0);
  const magA = Math.sqrt(resumeVec.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(jobVec.reduce((sum, v) => sum + v * v, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

/** Helper: fuzzy‑match a skill against a list, allowing a small Levenshtein distance. */
function fuzzyMatch(skill: string, candidates: string[], maxDist = 2): boolean {
  const lower = skill.toLowerCase();
  return candidates.some((c) => levenshtein.get(lower, c.toLowerCase()) <= maxDist);
}

/** Compute skill match score. */
function skillMatchScore(
  resumeSkills: string[],
  required: string[],
  preferred: string[]
): { score: number; details: { requiredMatched: number; requiredTotal: number; preferredMatched: number; preferredTotal: number } } {
  const requiredMatched = required.filter((s) => fuzzyMatch(s, resumeSkills)).length;
  const preferredMatched = preferred.filter((s) => fuzzyMatch(s, resumeSkills)).length;
  const requiredScore = required.length ? requiredMatched / required.length : 0;
  const preferredScore = preferred.length ? preferredMatched / preferred.length : 0;
  const score = requiredScore * 0.7 + preferredScore * 0.3;
  return {
    score,
    details: {
      requiredMatched,
      requiredTotal: required.length,
      preferredMatched,
      preferredTotal: preferred.length,
    },
  };
}

/** Extract total years of experience from plain text. */
function extractExperienceYears(text: string): number {
  const regex = /(\d+)\s+years?/gi;
  let total = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text))) {
    total += parseInt(match[1], 10);
  }
  return total;
}

/** Map education level string to numeric hierarchy. */
function mapEducationLevel(level: string): number {
  const normalized = level.toLowerCase();
  if (normalized.includes("high school")) return 1;
  if (normalized.includes("associate")) return 2;
  if (normalized.includes("bachelor")) return 3;
  if (normalized.includes("master")) return 4;
  if (normalized.includes("phd") || normalized.includes("doctor")) return 5;
  return 0; // unknown / not applicable
}

/** Simple format/completeness check. */
function formatScore(resumeText: string): number {
  const mandatorySections = [/contact/i, /experience/i, /education/i, /skills/i];
  const found = mandatorySections.filter((re) => re.test(resumeText)).length;
  const sectionScore = found / mandatorySections.length;
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  const lengthScore = wordCount >= 500 && wordCount <= 2000 ? 1 : 0.5; // simple heuristic
  return (sectionScore + lengthScore) / 2;
}

/** Main scoring function. */
export interface ScoreResult {
  score: number; // 0‑100 scale
  breakdown: {
    keywordScore: number;
    skillScore: number;
    experienceScore: number;
    educationScore: number;
    formatScore: number;
  };
}

/**
 * Compute an ATS score for a given resume and job description.
 * @param resume – object containing at least `rawText` and optional `skills` array.
 * @param job – object containing `rawText`, `requiredSkills`, `preferredSkills`, `minYearsExperience`, `educationLevel`.
 * @param options – optional weighting overrides.
 */
export function scoreResume(
  resume: { rawText: string; skills?: string[] },
  job: {
    rawText: string;
    requiredSkills: string[];
    preferredSkills: string[];
    minYearsExperience?: number;
    educationLevel?: string;
  },
  options?: Partial<AtsConfig>
): ScoreResult {
  const cfg: AtsConfig = { ...defaultConfig, ...options };

  // 1. Keyword similarity (TF‑IDF cosine)
  const keywordScore = tfidfCosineSimilarity(resume.rawText, job.rawText); // 0‑1

  // 2. Skill match – use supplied resume.skills or extract rudimentary from text
  const resumeSkills = resume.skills ?? [];
  const { score: skillScore } = skillMatchScore(resumeSkills, job.requiredSkills, job.preferredSkills);

  // 3. Experience relevance
  const resumeYears = extractExperienceYears(resume.rawText);
  const requiredYears = job.minYearsExperience ?? 0;
  const experienceScore = requiredYears === 0 ? 1 : Math.min(1, resumeYears / requiredYears);

  // 4. Education fit
  const resumeEdu = mapEducationLevel(resume.rawText);
  const jobEdu = job.educationLevel ? mapEducationLevel(job.educationLevel) : 0;
  const educationScore = jobEdu === 0 ? 1 : resumeEdu >= jobEdu ? 1 : 0;

  // 5. Format / completeness
  const fmtScore = formatScore(resume.rawText);

  // Weighted sum (each component already 0‑1)
  const weighted =
    keywordScore * cfg.keywordWeight +
    skillScore * cfg.skillWeight +
    experienceScore * cfg.experienceWeight +
    educationScore * cfg.educationWeight +
    fmtScore * cfg.formatWeight;

  const finalScore = Math.round(weighted * 100);

  return {
    score: finalScore,
    breakdown: {
      keywordScore: Math.round(keywordScore * 100),
      skillScore: Math.round(skillScore * 100),
      experienceScore: Math.round(experienceScore * 100),
      educationScore: Math.round(educationScore * 100),
      formatScore: Math.round(fmtScore * 100),
    },
  };
}
