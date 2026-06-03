"use client";

import { useState } from "react";

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

  const scoreColor = result
    ? result.score >= 80
      ? "text-green-600"
      : result.score >= 60
      ? "text-yellow-600"
      : "text-red-600"
    : "";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">ATS Score Checker</h1>
      <p className="text-gray-600 mb-6">
        Paste your resume text and a job description to get an ATS compatibility score
        and improvement suggestions.
      </p>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resume Text
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your full resume text here..."
            rows={14}
            className="w-full p-3 border rounded-lg text-sm font-mono whitespace-pre-wrap resize-y"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            rows={14}
            className="w-full p-3 border rounded-lg text-sm font-mono whitespace-pre-wrap resize-y"
          />
        </div>
      </div>

      <button
        onClick={handleScore}
        disabled={loading || resumeText.length < 50 || jobDescription.length < 50}
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Analyzing…" : "Score Resume"}
      </button>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">Error: {error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-6">
          {/* Score overview */}
          <div className="p-6 border rounded-lg bg-gray-50">
            <div className="text-center mb-4">
              <span className={`text-5xl font-bold ${scoreColor}`}>
                {result.score}
              </span>
              <span className="text-2xl text-gray-500">/ 100</span>
              <p className="mt-1 text-gray-600">ATS Compatibility Score</p>
            </div>

            {/* Breakdown */}
            {result.breakdown && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                {Object.entries(result.breakdown).map(([key, value]) => (
                  <div key={key} className="text-center p-2 bg-white rounded border">
                    <div className="text-lg font-semibold">{value as number}%</div>
                    <div className="text-xs text-gray-500 capitalize">
                      {key.replace("Score", "")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggestions */}
          {result.suggestions && result.suggestions.length > 0 && (
            <div className="p-6 border rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Improvement Suggestions</h2>
              <ul className="space-y-2">
                {result.suggestions.map((tip: string, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="mt-0.5 text-blue-500">&#8226;</span>
                    {tip}
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