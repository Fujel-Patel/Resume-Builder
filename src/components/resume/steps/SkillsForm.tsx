"use client";
import React, { useState } from 'react';
import { useResume } from '@/components/resume/BuilderWizard';
import type { ResumeData } from '@/types/resume';

export default function SkillsForm({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { data, saveStep } = useResume();
  const [skills, setSkills] = useState<string>((data.skills || []).join(', '));
  const [error, setError] = useState<string>('');

  const handleNext = async () => {
    if (!skills.trim()) {
      setError('Please enter at least one skill');
      return;
    }
    const skillArray = skills.split(',').map(s => s.trim()).filter(Boolean);
    await saveStep({ skills: skillArray } as Partial<ResumeData>);
    onNext();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Skills</h2>
      <textarea
        value={skills}
        onChange={e => setSkills(e.target.value)}
        placeholder="Comma separated skills, e.g., JavaScript, React, Node.js"
        rows={4}
        className="w-full p-2 border rounded"
      />
      {error && <p className="text-red-600">{error}</p>}
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
