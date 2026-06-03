"use client";
import React, { useState } from 'react';
import { useResume } from '@/components/resume/BuilderWizard';
import type { ResumeData } from '@/types/resume';

export default function SummaryForm({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { data, saveStep } = useResume();
  const [summary, setSummary] = useState<string>((data as any).summary || '');
  const [error, setError] = useState<string>('');

  const handleNext = async () => {
    if (!summary.trim()) {
      setError('Summary cannot be empty');
      return;
    }
    await saveStep({ summary } as Partial<ResumeData>);
    onNext();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Professional Summary</h2>
      <textarea
        value={summary}
        onChange={e => setSummary(e.target.value)}
        placeholder="Brief professional summary"
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
