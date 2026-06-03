"use client";

import { useState } from "react";
import { StreamingText } from "@/components/ai";

export default function AtsOptimizePage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedText, setOptimizedText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleOptimize = async () => {
    setError(null);
    setOptimizedText("");
    setIsOptimizing(true);

    try {
      const res = await fetch("/api/ai/ats-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to optimize");
      }

      // Stream the response text into optimizedText state
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
          setOptimizedText(fullText);
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCopy = async () => {
    if (!optimizedText) return;
    await navigator.clipboard.writeText(optimizedText);
  };

  const handleDownload = () => {
    if (!optimizedText) return;
    const blob = new Blob([optimizedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ats-optimized-resume.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">ATS Optimizer</h1>
      <p className="text-gray-600 mb-6">
        Paste your resume and a job description. Our AI will rewrite your resume to
        better match the job description keywords and requirements for ATS (Applicant Tracking System) compatibility.
      </p>

      {!isOptimizing && !optimizedText && (
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Resume Text
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your full resume text here...
Example:
John Doe
Software Engineer
...
EXPERIENCE
Senior Developer at Acme Corp (2020-Present)
- Built scalable APIs...
- Led team of 5 engineers..."
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
              placeholder="Paste the job description here...
Example:
We are looking for a Senior Software Engineer...
Required skills: React, TypeScript, Node.js, PostgreSQL...
Responsibilities: Build and maintain APIs..."
              rows={14}
              className="w-full p-3 border rounded-lg text-sm font-mono whitespace-pre-wrap resize-y"
            />
          </div>
        </div>
      )}

      {!isOptimizing && !optimizedText && (
        <button
          onClick={handleOptimize}
          disabled={resumeText.length < 50 || jobDescription.length < 50}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Optimize Resume
        </button>
      )}

      {isOptimizing && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-t-transparent border-indigo-600 rounded-full animate-spin" />
            <span className="text-sm text-gray-600 font-medium">
              Optimizing your resume for ATS compatibility...
            </span>
          </div>
          {optimizedText && (
            <div className="border rounded-lg p-4 bg-gray-50 overflow-auto max-h-[600px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Optimized Resume
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1 text-xs bg-white border rounded hover:bg-gray-50"
                  >
                    Copy
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1 text-xs bg-white border rounded hover:bg-gray-50"
                  >
                    Download
                  </button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">
                {optimizedText}
              </pre>
            </div>
          )}
        </div>
      )}

      {!isOptimizing && optimizedText && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-green-600">
              Optimization complete
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Download as Text
              </button>
              <button
                onClick={() => {
                  setOptimizedText("");
                  setIsOptimizing(false);
                }}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Optimize Another
              </button>
            </div>
          </div>
          <div className="border rounded-lg p-4 bg-gray-50 overflow-auto max-h-[600px]">
            <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">
              {optimizedText}
            </pre>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">Error: {error}</p>
        </div>
      )}

      {!isOptimizing && !optimizedText && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">How it works</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>1. Paste your current resume text</li>
            <li>2. Paste the job description you&apos;re targeting</li>
            <li>3. Our AI rewrites your resume to include relevant keywords naturally</li>
            <li>4. Copy the optimized result into your resume format</li>
          </ul>
        </div>
      )}
    </div>
  );
}