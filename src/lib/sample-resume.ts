import type { ResumeData } from '@/types/resume';

/** Representative resume data used to render template previews. */
export const SAMPLE_RESUME: ResumeData = {
  contact: {
    name: 'Jordan Avery',
    email: 'jordan.avery@example.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/jordanavery',
  },
  summary:
    'Full-stack engineer with 6+ years building scalable web applications and leading cross-functional teams.',
  experience: [
    {
      company: 'Acme Corp',
      role: 'Senior Software Engineer',
      duration: 'Jan 2021 - Present',
      location: 'San Francisco, CA',
      bullets: [
        'Led migration to a microservices architecture, cutting deploy time by 60%.',
        'Mentored a team of 5 engineers and established code review standards.',
      ],
    },
    {
      company: 'Globex',
      role: 'Software Engineer',
      duration: 'Jun 2018 - Dec 2020',
      location: 'Remote',
      bullets: [
        'Built a React component library adopted across 4 product teams.',
        'Improved API latency by 40% through query optimization.',
      ],
    },
  ],
  education: [
    {
      institution: 'University of California, Berkeley',
      degree: 'B.S. Computer Science',
      year: '2014 - 2018',
      gpa: '3.8',
    },
  ],
  skills: [
    { name: 'TypeScript' },
    { name: 'React' },
    { name: 'Node.js' },
    { name: 'PostgreSQL' },
    { name: 'AWS' },
  ],
  certifications: [
    { name: 'AWS Certified Solutions Architect', issuer: 'Amazon', date: '2022' },
  ],
  projects: [
    {
      name: 'Resume Builder',
      description: 'An AI-powered resume builder with ATS optimization.',
      technologies: ['Next.js', 'Prisma', 'Vercel AI SDK'],
    },
  ],
};
