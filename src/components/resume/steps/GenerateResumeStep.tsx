"use client";
import React, { useState } from 'react';
import { useResume } from '@/components/resume/BuilderWizard';

export default function GenerateResumeStep({ onBack }: { onBack: () => void }) {
  const { data } = useResume();
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: data }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate');
      }
      const text = await res.text();
      setGenerated(text);
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Generate Resume</h2>
      {generated ? (
        <div className="whitespace-pre-wrap rounded border p-4 bg-gray-50">
          {generated}
        </div>
      ) : (
        <p className="text-gray-600">Click the button to generate a polished resume using AI.</p>
      )}
      {error && <p className="text-red-600">{error}</p>}
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </div>
  );
}
