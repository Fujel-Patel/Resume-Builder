import type { ResumeData } from '@/types/resume';

interface ResumePreviewProps {
  data: ResumeData;
}

export function ClassicConservativeTemplate({ data }: ResumePreviewProps) {
  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <header className="border-b border-gray-200 px-8 py-6 text-center">
        <h1 className="text-3xl font-serif font-bold text-gray-900">{data.contact.name || 'Full Name'}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {[data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join(' | ')}
        </p>
        {data.contact.linkedin && (
          <p className="mt-1 font-serif text-sm text-gray-600 underline">{data.contact.linkedin}</p>
        )}
      </header>

      <div className="px-8 py-6">
        {data.summary && (
          <section className="mb-6 text-center">
            <h2 className="font-serif text-base font-semibold text-gray-800">Objective</h2>
            <p className="mx-auto mt-2 max-w-3xl text-sm leading-relaxed text-gray-700">{data.summary}</p>
          </section>
        )}

        <section className="mb-6">
          <div className="border-b border-gray-300 pb-1">
            <h2 className="text-center font-serif text-base font-semibold text-gray-800 uppercase tracking-wide">
              Professional Experience
            </h2>
          </div>
          <div className="mt-4 space-y-4">
            {data.experience.map((item, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <p className="font-serif text-xs font-semibold uppercase tracking-wide text-gray-600">{item.duration}</p>
                  {item.location && <p className="text-xs text-gray-500">{item.location}</p>}
                </div>
                <div className="col-span-2">
                  <p className="font-serif font-bold text-gray-900">{item.role}</p>
                  <p className="font-serif text-sm italic text-gray-700">{item.company}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                    {item.bullets.map((bullet, bIdx) => (
                      <li key={bIdx}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <div className="border-b border-gray-300 pb-1">
            <h2 className="text-center font-serif text-base font-semibold text-gray-800 uppercase tracking-wide">
              Education
            </h2>
          </div>
          <div className="mt-4 space-y-2">
            {data.education.map((item, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <p className="text-xs text-gray-600">{item.year}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-serif font-semibold text-gray-900">{item.degree}</p>
                  <p className="font-serif text-sm text-gray-700">
                    {item.institution}
                    {item.location && <span className="text-gray-500">, {item.location}</span>}
                  </p>
                  {item.gpa && <p className="text-sm text-gray-600">GPA: {item.gpa}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <div className="border-b border-gray-300 pb-1">
            <h2 className="text-center font-serif text-base font-semibold text-gray-800 uppercase tracking-wide">
              Skills & Certifications
            </h2>
          </div>
          <div className="mt-4 text-sm text-gray-700">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="font-serif font-semibold text-gray-800">Skills</p>
                <p className="mt-1">{data.skills.map(s => s.name).join(', ')}</p>
              </div>
              {data.certifications && data.certifications.length > 0 && (
                <div>
                  <p className="font-serif font-semibold text-gray-800">Certifications</p>
                  <ul className="mt-1 list-disc pl-5">
                    {data.certifications.map((cert, idx) => (
                      <li key={idx}>
                        {cert.name}
                        {cert.issuer && <span className="text-gray-500"> — {cert.issuer}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        {data.projects && data.projects.length > 0 && (
          <section>
            <div className="border-b border-gray-300 pb-1">
              <h2 className="text-center font-serif text-base font-semibold text-gray-800 uppercase tracking-wide">
                Selected Projects
              </h2>
            </div>
            <div className="mt-4 space-y-3 text-sm text-gray-700">
              {data.projects.map((project, idx) => (
                <div key={idx}>
                  <p className="font-serif font-semibold text-gray-900">{project.name}</p>
                  <p>{project.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
