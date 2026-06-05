"use client";

import { useState } from "react";
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function AtsScorePage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScore = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await fetch("/api/ats/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription,
        }),
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || err.details || "Failed to score");
      }
      const data = await resp.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[--color-success]';
    if (score >= 60) return 'text-[--color-warning]';
    return 'text-[--color-danger]';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-[--color-success]/10';
    if (score >= 60) return 'bg-[--color-warning]/10';
    return 'bg-[--color-danger]/10';
  };

  return (
    <div className="page-container p-6">
      <h1 className="section-heading text-3xl mb-6">
        ATS Score Checker
      </h1>
      <p className="text-[--text-secondary] mb-8">
        Paste your resume text and a job description to get an ATS compatibility score
        and improvement suggestions.
      </p>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div>
          <label className="block text-sm font-medium text-[--text-secondary] mb-2">
            Resume Text
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your full resume text here..."
            rows={14}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[--text-secondary] mb-2">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            rows={14}
            className="w-full"
          />
        </div>
      </div>

      <button
        onClick={handleScore}
        disabled={loading || resumeText.length < 50 || jobDescription.length < 50}
        className="btn-primary w-full mb-8"
      >
        {loading ? "Analyzing…" : "Score Resume"}
      </button>

      {error && (
        <div className="bg-[--color-danger]/10 border border-[--color-danger]/20 rounded-xl p-6">
          <p className="text-[--color-danger] text-sm">Error: {error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-8">
          {/* Score overview with circular progress */}
          <div className="text-center space-y-4">
            <div className="relative h-48 w-48 mx-auto">
              <svg className="h-48 w-48" viewBox="0 0 42 42">
                {/* Background circle */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.91549430918954"
                  fill="none"
                  stroke={getScoreBgColor(result.score)}
                  strokeWidth="2.83"
                />
                {/* Progress circle */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.91549430918954"
                  fill="none"
                  stroke={getScoreColor(result.score)}
                  strokeWidth="2.83"
                  strokeDasharray={`${(result.score / 100) * 100} 100`}
                  strokeDashoffset="0"
                  transition="stroke-dashoffset 0.5s ease-in-out"
                  style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                />
                {/* Animated stroke dash offset on load - we'll use a simple CSS animation */}
                {/* We'll add a class to trigger the animation */}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
                  {result.score}
                </span>
                <span className="text-2xl text-[--text-muted]">/ 100</span>
              </div>
            </div>
            <p className="text-[--text-primary] font-semibold">
              ATS Compatibility Score
            </p>
          </div>

          {/* Breakdown */}
          {result.breakdown && (
            <div className="space-y-4">
              <h2 className="section-heading text-xl mb-4">
                Score Breakdown
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(result.breakdown).map(([key, value]) => (
                  <div key={key} className="bg-[--bg-surface] border border-[--border] rounded-xl p-4 flex flex-col items-center">
                    <div className="text-lg font-semibold mb-2">
                      {value as number}%
                    </div>
                    <div className="w-full bg-[--bg-elevated] rounded-full h-2.5">
                      <div
                        className={`bg-${getScoreColor(result.score).replace('text-', 'bg-')} h-2.5 rounded-full`}
                        style={{ width: `${value as number}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-[--text-muted] capitalize">
                      {key.replace(/Score$/, '')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions && result.suggestions.length > 0 && (
            <div className="space-y-4">
              <h2 className="section-heading text-xl mb-4">
                Improvement Suggestions
              </h2>
              <ul className="space-y-3">
                {result.suggestions.map((tip: string, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-[--text-secondary]"
                  >
                    <CheckCircleIcon className="h-4 w-4 text-[--color-success] mt-0.5 flex-shrink-0" />
                    <p className="text-[--text-secondary]">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}