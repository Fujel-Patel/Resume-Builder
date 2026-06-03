import type { ResumeData } from '@/types/resume';

interface ResumePreviewProps {
  data: ResumeData;
}

export function TechnicalDeveloperTemplate({ data }: ResumePreviewProps) {
  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-gray-800 bg-white font-mono text-sm shadow-sm">
      <header className="border-b-4 border-emerald-400 bg-gray-900 px-8 py-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-emerald-400">$ whoami</p>
            <h1 className="mt-1 text-3xl font-bold text-white">{data.contact.name || 'Full Name'}</h1>
            <p className="mt-2 text-gray-400">
              {[data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join(' | ')}
            </p>
            {data.contact.linkedin && (
              <p className="mt-1 text-xs text-emerald-300">{data.contact.linkedin}</p>
            )}
          </div>
          <div className="hidden text-right text-xs text-gray-500 md:block">
            <p>ssh github.com</p>
            <p>github.com/{data.contact.name?.toLowerCase().replace(/\s+/g, '') || 'developer'}</p>
          </div>
        </div>
      </header>

      <div className="px-8 py-6">
        {data.summary && (
          <section className="mb-8 rounded-lg border border-emerald-100 bg-emerald-50/40 p-4">
            <p className="text-xs uppercase tracking-widest text-emerald-700">$ cat about.txt</p>
            <p className="mt-2 text-gray-800">{data.summary}</p>
          </section>
        )}

        {data.skills.length > 0 && (
          <section className="mb-8">
            <p className="text-xs uppercase tracking-widest text-emerald-700">$ ls skills/</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.skills.map((skill, idx) => (
                <span key={idx} className="rounded-md border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  &gt; {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="mb-8">
          <p className="text-xs uppercase tracking-widest text-emerald-700">$ git log -- work</p>
          <div className="mt-3 space-y-5">
            {data.experience.map((item, idx) => (
              <div key={idx} className="relative pl-5">
                <span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-emerald-400" />
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900">{item.role} <span className="text-gray-400">@</span> {item.company}</p>
                  </div>
                  <code className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-500">{item.duration}</code>
                </div>
                <ul className="mt-2 space-y-1 text-gray-700">
                  {item.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex gap-2">
                      <span className="text-gray-400">$&gt;</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <p className="text-xs uppercase tracking-widest text-emerald-700">$ cat education/*</p>
          <div className="mt-3 space-y-2">
            {data.education.map((item, idx) => (
              <div key={idx} className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">{item.degree}</p>
                  <p className="text-xs text-gray-600">{item.institution}</p>
                </div>
                <code className="text-xs text-gray-500">{item.year}</code>
              </div>
            ))}
          </div>
        </section>

        {(data.projects && data.projects.length > 0) || (data.certifications && data.certifications.length > 0) ? (
          <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {data.projects && data.projects.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-700">$ cat projects/*</p>
                <div className="mt-3 space-y-2 text-gray-700">
                  {data.projects.map((project, idx) => (
                    <div key={idx} className="rounded border border-gray-100 bg-gray-50 p-3">
                      <p className="font-bold text-gray-900">{project.name}</p>
                      <p className="text-xs text-gray-600">{project.description}</p>
                      {project.technologies && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {project.technologies.map((tech, tIdx) => (
                            <span key={tIdx} className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">#{tech}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.certifications && data.certifications.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-700">$ cat certs/*</p>
                <div className="mt-3 space-y-1 text-sm text-gray-700">
                  {data.certifications.map((cert, idx) => (
                    <div key={idx}>
                      <span className="text-emerald-700">✓</span> <span className="font-semibold text-gray-900">{cert.name}</span>
                      {cert.issuer && <span className="text-xs text-gray-500"> — {cert.issuer}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
