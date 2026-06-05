import { z } from 'zod';

// Personal Info Schema
export const personalInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').optional(),
});

// Work Experience Schema (for each experience item)
export const experienceSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  duration: z.string().min(1, 'Duration is required'),
  location: z.string().optional(),
  bullets: z.array(z.string()).min(1, 'At least one bullet point is required'),
});

// Education Schema (for each education item)
export const educationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  year: z.string().min(1, 'Year is required'),
  location: z.string().optional(),
  gpa: z.string().optional(),
});

// Skills Schema (for each skill item)
export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
});

// Summary Schema (required, with min and max length)
export const summarySchema = z.object({
  summary: z.string().min(1, 'Summary cannot be empty').max(500, 'Summary must not exceed 500 characters'),
});

// Skills form schema: expects a comma-separated string of skill names
export const skillsFormSchema = z.string().refine(
  (val) => {
    const skillsArray = val.split(',').map(s => s.trim()).filter(Boolean);
    return skillsArray.length > 0;
  },
  { message: 'Please enter at least one skill' }
);

// Form-specific schemas (for the entire form state)
export const personalInfoFormSchema = personalInfoSchema;
export const workExperienceFormSchema = z.object({
  experience: z.array(experienceSchema).min(1, 'At least one work experience is required'),
});
export const educationFormSchema = z.object({
  education: z.array(educationSchema).min(1, 'At least one education entry is required'),
});
export const summaryFormSchema = summarySchema;