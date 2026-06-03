import type { ResumeData } from '@/types/resume';

interface ResumePreviewProps {
  data: ResumeData;
}

export function ExecutiveSeniorTemplate({ data }: ResumePreviewProps) {
  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-gray-900 bg-white shadow-lg">
      <header className="bg-gray-900 px-8 py-7 text-white">
        <h1 className="text-3xl font-bold tracking-tight">{data.contact.name || 'Full Name'}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-300">
          <span>{data.contact.email}</span>
          <span className="h-1 w-1 rounded-full bg-gray-500" />
          <span>{data.contact.phone}</span>
          {data.contact.location && (
            <>
              <span className="h-1 w-1 rounded-full bg-gray-500" />
              <span>{data.contact.location}</span>
            </>
          )}
        </div>
        {data.contact.linkedin && (
          <p className="mt-2 text-sm text-amber-400">{data.contact.linkedin}</p>
        )}
      </header>

      <div className="px-8 py-7">
        {data.summary && (
          <section className="mb-8 border-b border-gray-200 pb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-700">Executive Summary</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-800">{data.summary}</p>
          </section>
        )}

        {data.experience.length > 0 && (
          <section className="mb-8 border-b border-gray-200 pb-6">
            {data.experience.map((item, idx) => (
              <div key={idx} className={idx > 0 ? 'mt-6' : ''}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-bold text-gray-900">{item.role}</p>
                    <p className="text-sm font-semibold text-gray-800">{item.company}</p>
                  </div>
                  <span className="rounded bg-gray-900 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-100">{item.duration}</span>
                </div>
                <ul className="mt-3 space-y-2 pr-12 text-sm leading-relaxed text-gray-700">
                  {item.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="relative pl-4">
                      <span className="absolute left-0 top-2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-amber-500" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {data.education.length > 0 && (
          <section className="mb-8 border-b border-gray-200 pb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700">Education</h2>
            <div className="mt-3 space-y-2">
              {data.education.map((item, idx) => (
                <div key={idx} className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.degree}</p>
                    <p className="text-sm text-gray-700">{item.institution}</p>
                  </div>
                  <span className="text-xs text-gray-500">{item.year}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {data.skills.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700">Core Competencies</h2>
              <div className="mt-3 space-y-1.5 text-sm text-gray-700">
                {data.skills.map((skill, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span className="font-medium text-gray-900">{skill.name}</span>
                    {skill.level && <span className="text-gray-500">({skill.level})</span>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {(data.certifications && data.certifications.length > 0) || (data.projects && data.projects.length > 0) ? (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700">Credentials</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
                {data.certifications?.map((cert, idx) => (
                  <li key={`cert-${idx}`}>
                    <span className="font-medium text-gray-900">{cert.name}</span>
                    {cert.issuer && <span className="text-gray-500"> · {cert.issuer}</span>}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
