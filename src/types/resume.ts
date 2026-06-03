export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
}

export interface Experience {
  company: string;
  role: string;
  duration: string; // e.g., "Jan 2020 - Present"
  location?: string;
  bullets: string[];
}

export interface Education {
  institution: string;
  degree: string;
  year: string; // e.g., "2018 - 2022"
  location?: string;
  gpa?: string;
}

export interface Skill {
  name: string;
  level?: string; // e.g., "Beginner", "Intermediate", "Advanced"
}

export interface Certification {
  name: string;
  issuer?: string;
  date?: string;
}

export interface Project {
  name: string;
  description: string;
  url?: string;
  technologies?: string[];
}

export interface ResumeData {
  contact: ContactInfo;
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  certifications?: Certification[];
  projects?: Project[];
}