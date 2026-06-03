import type { ResumeData } from '@/types/resume';

interface ResumePreviewProps {
  data: ResumeData;
}

export function FreshGraduateTemplate({ data }: ResumePreviewProps) {
  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-emerald-100 bg-white shadow-sm">
      <header className="border-b-4 border-emerald-400 bg-gradient-to-r from-emerald-50 to-white px-8 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-900">{data.contact.name || 'Full Name'}</h1>
            <p className="mt-2 text-sm text-emerald-800">
              {[data.contact.email, data.contact.phone].filter(Boolean).join(' · ')}
            </p>
            {data.contact.location && (
              <p className="text-xs text-emerald-600">{data.contact.location}</p>
            )}
            {data.contact.linkedin && (
              <p className="mt-1 text-xs text-emerald-600 underline">{data.contact.linkedin}</p>
            )}
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
            Graduate
          </div>
        </div>
      </header>

      <div className="px-8 py-6">
        {data.summary && (
          <section className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-700">About Me</h2>
            <p className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 text-sm leading-relaxed text-emerald-900">
              {data.summary}
            </p>
          </section>
        )}

        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-700">Education</h2>
          <div className="mt-3 space-y-3">
            {data.education.map((item, idx) => (
              <div key={idx} className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-emerald-900">{item.degree}</p>
                  <p className="text-sm text-emerald-800">{item.institution}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">{item.year}</span>
              </div>
            ))}
          </div>
        </section>

        {data.skills.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-700">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.skills.map((skill, idx) => (
                <span key={idx} className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm">
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {data.experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-700">Experience</h2>
            <div className="mt-3 space-y-4">
              {data.experience.map((item, idx) => (
                <div key={idx} className="border-l-4 border-emerald-300 pl-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-emerald-900">{item.role}</p>
                      <p className="text-sm text-emerald-800">{item.company}</p>
                    </div>
                    <span className="text-xs text-emerald-600">{item.duration}</span>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-emerald-900">
                    {item.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects && data.projects.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-700">Projects</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {data.projects.map((project, idx) => (
                <div key={idx} className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-3">
                  <p className="text-sm font-bold text-emerald-900">{project.name}</p>
                  <p className="mt-1 text-xs text-emerald-800">{project.description}</p>
                  {project.technologies && (
                    <p className="mt-2 text-xs text-emerald-600">{project.technologies.join(' · ')}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.certifications && data.certifications.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-700">Certifications</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.certifications.map((cert, idx) => (
                <span key={idx} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                  {cert.name} {cert.issuer && <span className="text-emerald-600">· {cert.issuer}</span>}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
