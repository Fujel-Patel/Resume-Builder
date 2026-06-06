"use client";

import { useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import FormField from "@/components/ui/FormField";
import Textarea from "@/components/ui/Textarea";

export default function AtsOptimizePage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await fetch("/api/ats/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || err.details || "Failed to optimize");
      }
      const data = await resp.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast({ title: "Copied", description: "Text copied to clipboard", variant: "default" });
  };

  return (
    <div className="page-container p-6">
      <h1 className="section-heading text-3xl mb-6">ATS Optimizer</h1>
      <p className="text-[--text-secondary] mb-8">
        Provide a current resume and a target job description. The optimizer will suggest concrete edits, display a diff view and let you accept or reject each suggestion.
      </p>

      {/* Input form – two‑column layout */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div>
          <label className="block text-sm font-medium text-[--text-secondary] mb-2">Current Resume</label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your current resume..."
            rows={14}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[--text-secondary] mb-2">Target Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description you&apos;re aiming for..."
            rows={14}
            className="w-full"
          />
        </div>
      </div>

      <Button
        onClick={handleOptimize}
        disabled={loading || resumeText.length < 50 || jobDescription.length < 50}
        variant="primary"
        className="w-full mb-8"
      >
        {loading ? "Optimizing…" : "Optimize Resume"}
      </Button>

      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <span className="text-white text-xl font-semibold">Optimizing…</span>
        </div>
      )}

      {error && (
        <div className="bg-[--color-danger]/10 border border-[--color-danger]/20 rounded-xl p-6 mb-6">
          <p className="text-[--color-danger] text-sm">Error: {error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-8">
          {/* Before / After sections */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h2 className="section-heading text-xl mb-2">Current Resume</h2>
              <pre className="whitespace-pre-wrap bg-[--bg-surface] p-4 rounded-md border border-[--border] max-h-80 overflow-y-auto">
                {result.originalResume ?? resumeText}
              </pre>
            </div>
            <div>
              <h2 className="section-heading text-xl mb-2">Optimized Resume</h2>
              <pre className="whitespace-pre-wrap bg-[--bg-surface] p-4 rounded-md border border-[--border] max-h-80 overflow-y-auto">
                {result.optimizedResume}
              </pre>
            </div>
          </div>

          {/* Diff view */}
          {result.diff && (
            <div>
              <h2 className="section-heading text-xl mb-2">Changes (Diff)</h2>
              <pre className="whitespace-pre-wrap bg-[--bg-surface] p-4 rounded-md border border-[--border] max-h-96 overflow-y-auto font-mono text-sm">
                {result.diff.map((line: string, i: number) => {
                  if (line.startsWith('+')) return (<span key={i} className="text-[--color-success]">{line}\n</span>);
                  if (line.startsWith('-')) return (<span key={i} className="text-[--color-danger]">{line}\n</span>);
                  return (<span key={i}>{line}\n</span>);
                })}
              </pre>
            </div>
          )}

          {/* Suggestions with accept/reject placeholders */}
          {result.suggestions && result.suggestions.length > 0 && (
            <div className="space-y-4">
              <h2 className="section-heading text-xl mb-2">Suggestions</h2>
              <ul className="space-y-3">
                {result.suggestions.map((s: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircleIcon className="h-5 w-5 text-[--color-success] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[--text-secondary]">{s.text}</p>
                      <div className="mt-2 flex space-x-2">
                        <Button variant="secondary" size="sm" onClick={() => copyToClipboard(s.text)}>
                          Copy
                        </Button>
                        {/* Accept / Reject toggle could be added here */}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Apply all and prominent copy buttons */}
          <div className="flex space-x-4 mt-6 justify-center">
            <Button variant="primary" size="lg" onClick={() => {
              // In a real implementation this would send the accepted suggestions
              addToast({ title: "Applied", description: "All suggestions applied (demo)", variant: "default" });
            }}>
              Apply All
            </Button>
            <Button variant="secondary" size="lg" onClick={() => copyToClipboard(result.optimizedResume)}>
              Copy Optimized Resume
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
