"use client";

import { useState } from 'react';
import UploadResumeForm from '@/components/resume/UploadResumeForm';
import type {
  ContactInfo,
  Experience as ExperienceItem,
  Education as EducationItem,
  Skill as SkillItem,
  Project as ProjectItem,
  Certification as CertificationItem,
  ResumeData,
} from '@/types/resume';

// The existing type definitions in '@/types/resume' differ slightly; we adapt them here.
// ContactInfo maps to the previous PersonalInfo fields.
interface PersonalInfo extends ContactInfo {}

// Helper component for navigation buttons
function NavButtons({ onPrev, onNext, disablePrev, disableNext }: { onPrev?: () => void; onNext?: () => void; disablePrev?: boolean; disableNext?: boolean }) {
  return (
    <div className="flex justify-between mt-4">
      {onPrev && (
        <button
          type="button"
          onClick={onPrev}
          disabled={disablePrev}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
      )}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={disableNext}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      )}
    </div>
  );
}

// Individual step components – each receives the current data slice and a setter
function PersonalInfoStep({ data, setData }: { data: PersonalInfo; setData: (d: PersonalInfo) => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Personal Information</h2>
      <input
        className="w-full p-2 border rounded"
        placeholder="First name"
        value={data.name ?? ''}
        onChange={e => setData({ ...data, name: e.target.value })}
      />
      <input
        className="w-full p-2 border rounded"
        placeholder="Email"
        type="email"
        value={data.email ?? ''}
        onChange={e => setData({ ...data, email: e.target.value })}
      />
      <input
        className="w-full p-2 border rounded"
        placeholder="Phone (optional)"
        value={data.phone ?? ''}
        onChange={e => setData({ ...data, phone: e.target.value })}
      />
      <input
        className="w-full p-2 border rounded"
        placeholder="Location (optional)"
        value={data.location ?? ''}
        onChange={e => setData({ ...data, location: e.target.value })}
      />
    </div>
  );
}

function ExperienceStep({ data, setData }: { data: ExperienceItem[]; setData: (d: ExperienceItem[]) => void }) {
  const addEmpty = () => setData([...data, { company: '', role: '', duration: '', bullets: [] }]);
  const updateItem = (idx: number, fields: Partial<ExperienceItem>) => {
    const updated = data.map((item, i) => (i === idx ? { ...item, ...fields } : item));
    setData(updated);
  };
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Experience</h2>
      {data.map((exp, idx) => (
        <div key={idx} className="border p-2 rounded space-y-2">
          <input
            className="w-full p-1 border rounded"
            placeholder="Company"
            value={exp.company}
            onChange={e => updateItem(idx, { company: e.target.value })}
          />
          <input
            className="w-full p-1 border rounded"
            placeholder="Role"
            value={exp.role}
            onChange={e => updateItem(idx, { role: e.target.value })}
          />
          <input
            className="w-full p-1 border rounded"
            placeholder="Duration"
            value={exp.duration}
            onChange={e => updateItem(idx, { duration: e.target.value })}
          />
          <textarea
            className="w-full p-1 border rounded"
            placeholder="Bullets (one per line)"
            rows={3}
            value={exp.bullets?.join('\n') ?? ''}
            onChange={e => updateItem(idx, { bullets: e.target.value.split('\n') })}
          />
        </div>
      ))}
      <button type="button" onClick={addEmpty} className="px-3 py-1 bg-gray-200 rounded">
        Add Experience
      </button>
    </div>
  );
}

function EducationStep({ data, setData }: { data: EducationItem[]; setData: (d: EducationItem[]) => void }) {
  const addEmpty = () => setData([...data, { institution: '', degree: '', year: '' }]);
  const updateItem = (idx: number, fields: Partial<EducationItem>) => {
    const updated = data.map((item, i) => (i === idx ? { ...item, ...fields } : item));
    setData(updated);
  };
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Education</h2>
      {data.map((edu, idx) => (
        <div key={idx} className="border p-2 rounded space-y-2">
          <input
            className="w-full p-1 border rounded"
            placeholder="Institution"
            value={edu.institution}
            onChange={e => updateItem(idx, { institution: e.target.value })}
          />
          <input
            className="w-full p-1 border rounded"
            placeholder="Degree"
            value={edu.degree}
            onChange={e => updateItem(idx, { degree: e.target.value })}
          />
          <input
            className="w-full p-1 border rounded"
            placeholder="Year(s)"
            value={edu.year}
            onChange={e => updateItem(idx, { year: e.target.value })}
          />
          <input
            className="w-full p-1 border rounded"
            placeholder="Location (optional)"
            value={edu.location ?? ''}
            onChange={e => updateItem(idx, { location: e.target.value })}
          />
          <input
            className="w-full p-1 border rounded"
            placeholder="GPA (optional)"
            value={edu.gpa ?? ''}
            onChange={e => updateItem(idx, { gpa: e.target.value })}
          />
        </div>
      ))}
      <button type="button" onClick={addEmpty} className="px-3 py-1 bg-gray-200 rounded">
        Add Education
      </button>
    </div>
  );
}

function SkillsStep({ data, setData }: { data: SkillItem[]; setData: (d: SkillItem[]) => void }) {
  const addEmpty = () => setData([...data, { name: '' }]);
  const updateItem = (idx: number, fields: Partial<SkillItem>) => {
    const updated = data.map((item, i) => (i === idx ? { ...item, ...fields } : item));
    setData(updated);
  };
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Skills</h2>
      {data.map((skill, idx) => (
        <div key={idx} className="flex space-x-2 items-center">
          <input
            className="flex-1 p-1 border rounded"
            placeholder="Skill name"
            value={skill.name}
            onChange={e => updateItem(idx, { name: e.target.value })}
          />
          <input
            className="w-32 p-1 border rounded"
            placeholder="Level (optional)"
            value={skill.level ?? ''}
            onChange={e => updateItem(idx, { level: e.target.value })}
          />
        </div>
      ))}
      <button type="button" onClick={addEmpty} className="px-3 py-1 bg-gray-200 rounded">
        Add Skill
      </button>
    </div>
  );
}

function ProjectsStep({ data, setData }: { data: ProjectItem[]; setData: (d: ProjectItem[]) => void }) {
  const addEmpty = () => setData([...data, { name: '', description: '' }]);
  const updateItem = (idx: number, fields: Partial<ProjectItem>) => {
    const updated = data.map((item, i) => (i === idx ? { ...item, ...fields } : item));
    setData(updated);
  };
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Projects</h2>
      {data.map((proj, idx) => (
        <div key={idx} className="border p-2 rounded space-y-2">
          <input
            className="w-full p-1 border rounded"
            placeholder="Project name"
            value={proj.name}
            onChange={e => updateItem(idx, { name: e.target.value })}
          />
          <textarea
            className="w-full p-1 border rounded"
            placeholder="Description"
            rows={2}
            value={proj.description}
            onChange={e => updateItem(idx, { description: e.target.value })}
          />
          <input
            className="w-full p-1 border rounded"
            placeholder="Link (optional)"
            value={proj.url ?? ''}
            onChange={e => updateItem(idx, { url: e.target.value })}
          />
        </div>
      ))}
      <button type="button" onClick={addEmpty} className="px-3 py-1 bg-gray-200 rounded">
        Add Project
      </button>
    </div>
  );
}

function CertificationsStep({ data, setData }: { data: CertificationItem[]; setData: (d: CertificationItem[]) => void }) {
  const addEmpty = () => setData([...data, { name: '', issuer: '' }]);
  const updateItem = (idx: number, fields: Partial<CertificationItem>) => {
    const updated = data.map((item, i) => (i === idx ? { ...item, ...fields } : item));
    setData(updated);
  };
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Certifications</h2>
      {data.map((cert, idx) => (
        <div key={idx} className="border p-2 rounded space-y-2">
          <input
            className="w-full p-1 border rounded"
            placeholder="Certification name"
            value={cert.name}
            onChange={e => updateItem(idx, { name: e.target.value })}
          />
          <input
            className="w-full p-1 border rounded"
            placeholder="Issuer / Authority"
            value={cert.issuer ?? ''}
            onChange={e => updateItem(idx, { issuer: e.target.value })}
          />
          <input
            className="w-full p-1 border rounded"
            placeholder="Date (optional)"
            value={cert.date ?? ''}
            onChange={e => updateItem(idx, { date: e.target.value })}
          />
        </div>
      ))}
      <button type="button" onClick={addEmpty} className="px-3 py-1 bg-gray-200 rounded">
        Add Certification
      </button>
    </div>
  );
}

export default function ResumeBuilder() {
  const [step, setStep] = useState(0);
  const [personal, setPersonal] = useState<PersonalInfo>({ name: '', email: '' });
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const steps = [
    { label: 'Personal Info', component: <PersonalInfoStep data={personal} setData={setPersonal} /> },
    { label: 'Experience', component: <ExperienceStep data={experience} setData={setExperience} /> },
    { label: 'Education', component: <EducationStep data={education} setData={setEducation} /> },
    { label: 'Skills', component: <SkillsStep data={skills} setData={setSkills} /> },
    { label: 'Projects', component: <ProjectsStep data={projects} setData={setProjects} /> },
    { label: 'Certifications', component: <CertificationsStep data={certifications} setData={setCertifications} /> },
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    const payload: ResumeData = {
      contact: personal,
      experience,
      education,
      skills,
      certifications,
      projects,
    } as any; // casting to any to satisfy type mismatch; adjust as needed
    try {
      const res = await fetch('/api/resumes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save resume');
      alert('Resume saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Error saving resume');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Multi‑step Resume Builder</h1>
      <div className="border rounded p-4">
          <UploadResumeForm />
        {steps[step].component}
        <NavButtons
          onPrev={() => setStep(s => Math.max(s - 1, 0))}
          onNext={step < steps.length - 1 ? () => setStep(s => s + 1) : undefined}
          disablePrev={step === 0}
        />
        {step === steps.length - 1 && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Resume'}
          </button>
        )}
      </div>
    </div>
  );
}
