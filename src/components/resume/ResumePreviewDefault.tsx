"use client";
import type { ResumeData } from '@/types/resume';

export default function ResumePreviewDefault({ data }: { data: ResumeData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Live Preview</h2>
      {/* Contact Info */}
      <div className="border-b pb-2">
        <p className="font-medium text-lg">{data.contact.name || 'Your Name'}</p>
        <p className="text-sm text-gray-500">
          {data.contact.email} · {data.contact.phone || ''}{data.contact.location ? ` · ${data.contact.location}` : ''}
        </p>
        {data.contact.linkedin && (
          <p className="text-sm text-gray-500">LinkedIn: {data.contact.linkedin}</p>
        )}
      </div>
      {/* Summary */}
      {data.summary && (
        <div className="border-b pb-2">
          <h3 className="font-semibold text-gray-700">Professional Summary</h3>
          <p className="text-gray-600">{data.summary}</p>
        </div>
      )}
      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="border-b pb-2">
          <h3 className="font-semibold text-gray-700">Experience</h3>
          {data.experience.map((exp, idx) => (
            <div key={idx} className="mb-4 last:mb-0">
              <p className="font-medium">
                {exp.role} at {exp.company}
              </p>
              <p className="text-sm text-gray-500">
                {exp.duration} {exp.location ? `· ${exp.location}` : ''}
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-600">
                {exp.bullets.map((bullet, bix) => (
                  <li key={bix}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {/* Education */}
      {data.education.length > 0 && (
        <div className="border-b pb-2">
          <h3 className="font-semibold text-gray-700">Education</h3>
          {data.education.map((edu, idx) => (
            <div key={idx} className="mb-4 last:mb-0">
              <p className="font-medium">
                {edu.degree} — {edu.institution}
              </p>
              <p className="text-sm text-gray-500">
                {edu.year}
                {edu.location ? ` · ${edu.location}` : ''}
              </p>
              {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </div>
      )}
      {/* Skills */}
      {data.skills.length > 0 && (
        <div className="border-b pb-2">
          <h3 className="font-semibold text-gray-700">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, idx) => (
              <span
                key={idx}
                className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded"
              >
                {skill.name}
                {skill.level && ` (${skill.level})`}
              </span>
            ))}
          </div>
        </div>
      )}
      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div className="border-b pb-2">
          <h3 className="font-semibold text-gray-700">Certifications</h3>
          <ul className="list-disc list-inside mt-2 text-gray-600">
            {data.certifications.map((cert, idx) => (
              <li key={idx}>
                {cert.name}
                {cert.issuer && ` — ${cert.issuer}`}
                {cert.date && `, ${cert.date}`}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div className="border-b pb-2">
          <h3 className="font-semibold text-gray-700">Projects</h3>
          {data.projects.map((proj, idx) => (
            <div key={idx} className="mb-4 last:mb-0">
              <p className="font-medium">{proj.name}</p>
              <p className="text-gray-600">{proj.description}</p>
              {proj.technologies && proj.technologies.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {proj.technologies.map((tech, tix) => (
                    <span
                      key={tix}
                      className="bg-gray-100 text-gray-800 text-xs px-1.5 py-0.5 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              {proj.url && (
                <a
                  href={proj.url}
                  className="mt-1 inline-block text-indigo-600 hover:underline text-sm"
                >
                  View project
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
