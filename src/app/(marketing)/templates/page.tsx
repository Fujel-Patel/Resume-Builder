import Link from 'next/link';
import { getAllTemplates } from '@/components/templates';

export const metadata = {
  title: 'Resume Templates',
  description: 'Choose a template to get started. Preview each style and apply it to your resume.',
};

const SAMPLE: import('@/types/resume').ResumeData = {
  contact: {
    name: 'Jordan Rivera',
    email: 'jordan.rivera@example.com',
    phone: '(415) 555-0199',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/jordanrivera',
  },
  summary: 'Full-stack product engineer focused on clean interfaces, reliable data flows, and teams that ship quickly.',
  experience: [
    {
      company: 'River Studio',
      role: 'Senior Engineer',
      duration: '2022 - Present',
      location: 'Remote',
      bullets: [
        'Led six end-to-end feature launches across checkout, scheduling, and messaging.',
        'Drove adoption of typed APIs and automated UI tests, reducing regression escapes by 34%.',
      ],
    },
    {
      company: 'Mapgrid',
      role: 'Software Engineer',
      duration: '2019 - 2022',
      location: 'Austin, TX',
      bullets: [
        'Built map and routing features consumed by 180k monthly active users.',
        'Collaborated with design, QA, and product on a quarterly roadmap.',
      ],
    },
  ],
  education: [
    {
      institution: 'University of Texas at Austin',
      degree: 'B.S. Computer Science',
      year: '2015 - 2019',
      gpa: '3.6',
    },
  ],
  skills: [
    { name: 'TypeScript' },
    { name: 'React' },
    { name: 'Node.js' },
    { name: 'PostgreSQL' },
    { name: 'AWS' },
    { name: 'Docker' },
  ],
  certifications: [
    { name: 'AWS Solutions Architect Associate', issuer: 'Amazon Web Services' },
    { name: 'Meta Front-End Developer', issuer: 'Coursera' },
  ],
  projects: [
    {
      name: 'Route Tiles',
      description: 'Open-source routing demo for map providers.',
      url: '#',
      technologies: ['TypeScript', 'MapLibre'],
    },
  ],
};

export default function TemplatesGalleryPage() {
  const templates = getAllTemplates();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Resume templates</h1>
          <p className="mt-3 text-lg text-gray-700">
            Pick a template to review and use it when you edit or create a resume.
          </p>
          <div className="mt-6">
            <Link
              href="/builder"
              className="inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Open resume builder
            </Link>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => {
            const Preview = template.Component;
            return (
              <div
                key={template.id}
                className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg"
              >
                <div className="h-72 overflow-hidden border-b border-gray-100 bg-gray-50">
                  <Preview data={SAMPLE} />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{template.name}</h2>
                    <p className="mt-2 text-sm text-gray-700">{template.description}</p>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
