"use client";

import React, { useState } from "react";
import { createClient as createSupabaseClient } from "@/utils/supabase/client";
import Button from "@/components/ui/Button";

/**
 * Simple multi‑step form (single step for now) to generate a cover letter.
 * It collects the resume text and a job description, posts to the AI API,
 * and streams the generated cover letter back to the UI.
 */
export default function CoverLetterForm() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Check Supabase auth on mount
  React.useEffect(() => {
    const supabase = createSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCoverLetter("");
    if (!user) {
      setError("You must be logged in to generate a cover letter.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate cover letter");
      }

      // Stream text response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done && reader) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          setCoverLetter(prev => prev + decoder.decode(value, { stream: true }));
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <p className="text-red-600">Please log in to use the cover‑letter generator.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Generate a Cover Letter</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resume Text</label>
          <textarea
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            rows={8}
            required
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            rows={6}
            required
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        {error && <p className="text-red-600">{error}</p>}
        <Button
          type="submit"
          disabled={loading}
          variant="primary"
          size="md"
        >
          {loading ? "Generating…" : "Generate Cover Letter"}
        </Button>
      </form>
      {coverLetter && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-2">Generated Cover Letter</h3>
          <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded border">{coverLetter}</pre>
        </div>
      )}
    </div>
  );
}
