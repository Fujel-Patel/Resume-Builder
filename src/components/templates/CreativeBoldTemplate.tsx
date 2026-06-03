import type { ResumeData } from '@/types/resume';

interface ResumePreviewProps {
  data: ResumeData;
}

export function CreativeBoldTemplate({ data }: ResumePreviewProps) {
  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-gray-900 bg-white shadow-md">
      <header className="relative bg-gray-900 px-8 py-8 text-white">
        <div className="absolute inset-x-0 -bottom-3 h-6 rotate-2 bg-indigo-500" aria-hidden="true" />
        <h1 className="relative text-3xl font-black uppercase tracking-tight">{data.contact.name || 'Full Name'}</h1>
        <p className="relative mt-3 font-mono text-sm text-gray-300">
          {[data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join(' // ')}
        </p>
        {data.contact.linkedin && (
          <p className="relative mt-1 font-mono text-sm text-indigo-300">{data.contact.linkedin}</p>
        )}
      </header>

      <div className="px-8 py-8">
        {data.summary && (
          <section className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900">About</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">{data.summary}</p>
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900">Selected Experience</h2>
          <div className="mt-4 space-y-6">
            {data.experience.map((item, idx) => (
              <div key={idx} className="border-l-4 border-indigo-500 pl-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-base font-bold text-gray-900">{item.role}</p>
                  <span className="rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-semibold text-indigo-700">{item.duration}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">{item.company}</p>
                <ul className="mt-2 space-y-1.5 text-sm text-gray-700">
                  {item.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900">Tech & Tools</h2>
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, idx) => (
                <span key={idx} className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900">Background</h2>
            <div className="mt-3 space-y-3 text-sm text-gray-700">
              {data.education.map((item, idx) => (
                <div key={idx}>
                  <p className="font-bold text-gray-900">{item.degree}</p>
                  <p>{item.institution}</p>
                  <p className="text-xs text-gray-500">{item.year}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900">Highlights</h2>
            <div className="mt-3 space-y-3 text-sm text-gray-700">
              {data.projects && data.projects.length > 0 ? (
                data.projects.map((project, idx) => (
                  <div key={idx}>
                    <p className="font-bold text-gray-900">{project.name}</p>
                    <p className="text-xs text-gray-600">{project.description}</p>
                  </div>
                ))
              ) : (
                data.certifications && data.certifications.length > 0 ? (
                  data.certifications.map((cert, idx) => (
                    <div key={idx}>
                      <p className="font-bold text-gray-900">{cert.name}</p>
                      <p className="text-xs text-gray-600">{cert.issuer}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">No projects to show.</p>
                )
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
