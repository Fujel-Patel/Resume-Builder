export interface ParsedJD {
  title?: string;
  company?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  keywords: string[];
  responsibilities: string[];
  experienceLevel?: string;
  educationRequirements?: string;
  certifications?: string[];
  rawText: string;
}

export interface JDParseRequest {
  jobDescription: string;
}

export interface JDParseResponse {
  success: boolean;
  data?: ParsedJD;
  error?: string;
  provider?: string;
  model?: string;
}
