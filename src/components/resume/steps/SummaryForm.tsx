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
      <h2 className="text-xl font-semibold section-heading">Professional Summary</h2>
      <textarea
        value={summary}
        onChange={e => setSummary(e.target.value)}
        placeholder="Brief professional summary"
        rows={4}
        className="w-full"
      />
      {error && <p className="mt-1 text-sm text-[--color-danger]">{error}</p>}
      <div className="flex space-x-3 mt-4">
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="btn-primary"
        >
          Next
        </button>
      </div>
    </div>
  );
}
