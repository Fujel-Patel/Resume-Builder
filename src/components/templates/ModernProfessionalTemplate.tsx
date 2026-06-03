import type { ResumeData } from '@/types/resume';

interface ResumePreviewProps {
  data: ResumeData;
}

export function ModernProfessionalTemplate({ data }: ResumePreviewProps) {
  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <header className="bg-sky-600 px-8 py-6 text-white">
        <h1 className="text-2xl font-bold">{data.contact.name || 'Full Name'}</h1>
        <p className="mt-1 text-sm text-sky-100">
          {[data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join(' · ')}
        </p>
        {data.contact.linkedin && (
          <p className="mt-0.5 text-sm text-sky-100">{data.contact.linkedin}</p>
        )}
      </header>

      <div className="px-8 py-6">
        {data.summary && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-sky-800">Professional Summary</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">{data.summary}</p>
          </section>
        )}

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-sky-800">Experience</h2>
          <div className="mt-3 space-y-4">
            {data.experience.map((item, idx) => (
              <div key={idx}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{item.role}</p>
                    <p className="text-sm text-gray-700">{item.company}</p>
                  </div>
                  <span className="text-xs text-gray-500">{item.duration}</span>
                </div>
                {item.location && <p className="text-xs text-gray-500">{item.location}</p>}
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                  {item.bullets.map((bullet, bIdx) => (
                    <li key={bIdx}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-sky-800">Skills</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.skills.map((skill, idx) => (
              <span key={idx} className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 ring-1 ring-sky-100">
                {skill.name}
                {skill.level && <span className="ml-1 text-sky-500">• {skill.level}</span>}
              </span>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-sky-800">Education</h2>
          <div className="mt-3 space-y-2">
            {data.education.map((item, idx) => (
              <div key={idx}>
                <p className="font-medium text-gray-900">{item.degree}</p>
                <p className="text-sm text-gray-700">{item.institution}</p>
                <span className="text-xs text-gray-500">{item.year}</span>
                {item.gpa && <span className="text-xs text-gray-500"> · GPA: {item.gpa}</span>}
              </div>
            ))}
          </div>
        </section>

        {data.projects && data.projects.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-sky-800">Projects</h2>
            <div className="mt-3 space-y-3">
              {data.projects.map((project, idx) => (
                <div key={idx}>
                  <p className="font-medium text-gray-900">{project.name}</p>
                  <p className="text-sm text-gray-700">{project.description}</p>
                  {project.technologies && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {project.technologies.map((tech, tIdx) => (
                        <span key={tIdx} className="rounded bg-sky-50 px-2 py-0.5 text-xs text-sky-700">{tech}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.certifications && data.certifications.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-sky-800">Certifications</h2>
            <ul className="mt-3 space-y-1 text-sm text-gray-700">
              {data.certifications.map((cert, idx) => (
                <li key={idx}>
                  <span className="font-medium">{cert.name}</span>
                  {cert.issuer && <span className="text-gray-500"> · {cert.issuer}</span>}
                  {cert.date && <span className="text-gray-500"> · {cert.date}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
