import type { ResumeData } from '@/types/resume';

interface ResumePreviewProps {
  data: ResumeData;
}

export function MinimalCleanTemplate({ data }: ResumePreviewProps) {
  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
      <header className="px-10 py-8">
        <h1 className="text-3xl font-light tracking-tight text-gray-900">{data.contact.name || 'Full Name'}</h1>
        <p className="mt-3 text-sm text-gray-500">
          {[data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join(' · ')}
        </p>
        {data.contact.linkedin && (
          <p className="mt-0.5 text-sm text-gray-400">{data.contact.linkedin}</p>
        )}
      </header>

      <hr className="mx-10 border-gray-200" />

      <div className="px-10 py-8">
        {data.summary && (
          <section className="mb-8">
            <p className="text-sm leading-relaxed text-gray-700">{data.summary}</p>
          </section>
        )}

        {data.experience.length > 0 && (
          <section className="mb-8">
            {data.experience.map((item, idx) => (
              <div key={idx} className="mb-6">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.role}</p>
                    <p className="text-sm text-gray-600">{item.company}</p>
                  </div>
                  <span className="text-xs text-gray-400">{item.duration}</span>
                </div>
                {item.location && <p className="text-xs text-gray-400">{item.location}</p>}
                <ul className="mt-2 space-y-1 text-sm text-gray-700">
                  {item.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-gray-300" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {data.education.length > 0 && (
          <section className="mb-8">
            {data.education.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.degree}</p>
                  <p className="text-sm text-gray-600">{item.institution}</p>
                </div>
                <span className="text-xs text-gray-400">{item.year}</span>
              </div>
            ))}
          </section>
        )}

        {data.skills.length > 0 && (
          <section className="mb-8">
            <p className="text-sm leading-relaxed text-gray-700">
              {data.skills.map(s => s.name).join(' · ')}
            </p>
          </section>
        )}

        {data.projects && data.projects.length > 0 && (
          <section className="mb-8">
            {data.projects.map((project, idx) => (
              <div key={idx} className="mb-4">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-semibold text-gray-900">{project.name}</p>
                </div>
                <p className="mt-1 text-sm text-gray-700">{project.description}</p>
                {project.technologies && (
                  <p className="mt-1 text-xs text-gray-400">{project.technologies.join(', ')}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {data.certifications && data.certifications.length > 0 && (
          <section>
            {data.certifications.map((cert, idx) => (
              <div key={idx} className="mb-2">
                <span className="text-sm text-gray-700">
                  <span className="font-medium text-gray-900">{cert.name}</span>
                  {cert.issuer && <span className="text-gray-500"> — {cert.issuer}</span>}
                </span>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
