import type { ResumeData } from '@/types/resume';

interface ResumePreviewProps {
  data: ResumeData;
}

export function AcademicScholarTemplate({ data }: ResumePreviewProps) {
  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <header className="border-b-2 border-gray-900 px-10 py-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">{data.contact.name || 'Full Name'}</h1>
        <p className="mt-3 text-sm font-serif text-gray-700">
          {[data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join(' · ')}
        </p>
        {data.contact.linkedin && (
          <p className="mt-1 font-serif text-sm text-gray-500">{data.contact.linkedin}</p>
        )}
      </header>

      <div className="px-10 py-8">
        {data.summary && (
          <section className="mb-8">
            <h2 className="border-b border-gray-200 pb-1 font-serif text-base font-semibold text-gray-900">
              Research Interests
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">{data.summary}</p>
          </section>
        )}

        {data.experience.length > 0 && (
          <section className="mb-8">
            <h2 className="border-b border-gray-200 pb-1 font-serif text-base font-semibold text-gray-900">
              Appointments
            </h2>
            <div className="mt-4 space-y-4">
              {data.experience.map((item, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <p className="text-xs text-gray-600">{item.duration}</p>
                    {item.location && <p className="text-xs text-gray-500">{item.location}</p>}
                  </div>
                  <div className="col-span-2">
                    <p className="font-serif font-bold text-gray-900">{item.role}</p>
                    <p className="font-serif text-sm italic text-gray-700">{item.company}</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-700">
                      {item.bullets.map((bullet, bIdx) => (
                        <li key={bIdx}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.education.length > 0 && (
          <section className="mb-8">
            <h2 className="border-b border-gray-200 pb-1 font-serif text-base font-semibold text-gray-900">
              Education
            </h2>
            <div className="mt-4 space-y-3">
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
        )}

        {data.skills.length > 0 && (
          <section className="mb-8">
            <h2 className="border-b border-gray-200 pb-1 font-serif text-base font-semibold text-gray-900">
              Areas of Expertise
            </h2>
            <p className="mt-3 text-sm text-gray-700">{data.skills.map(s => s.name).join(' · ')}</p>
          </section>
        )}

        {(data.projects && data.projects.length > 0) || (data.certifications && data.certifications.length > 0) ? (
          <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {data.projects && data.projects.length > 0 && (
              <div>
                <h2 className="border-b border-gray-200 pb-1 font-serif text-base font-semibold text-gray-900">
                  Selected Research & Projects
                </h2>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  {data.projects.map((project, idx) => (
                    <div key={idx}>
                      <p className="font-semibold text-gray-900">{project.name}</p>
                      <p>{project.description}</p>
                      {project.technologies && (
                        <p className="text-xs text-gray-500">{project.technologies.join(', ')}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.certifications && data.certifications.length > 0 && (
              <div>
                <h2 className="border-b border-gray-200 pb-1 font-serif text-base font-semibold text-gray-900">
                  Honors & Awards
                </h2>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
                  {data.certifications.map((cert, idx) => (
                    <li key={idx}>
                      <span className="font-semibold text-gray-900">{cert.name}</span>
                      {cert.issuer && <span className="text-gray-500"> — {cert.issuer}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
