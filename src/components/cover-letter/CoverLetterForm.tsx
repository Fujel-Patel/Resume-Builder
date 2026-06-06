"use client";

import React, { useState } from "react";
import { createClient as createSupabaseClient } from "@/utils/supabase/client";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { useRouter } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

/**
 * Simple multi‑step form (single step for now) to generate a cover letter.
 * It collects the resume text and a job description, posts to the AI API,
 * and streams the generated cover letter back to the UI.
 */
export default function CoverLetterForm() {
  const [resumeText, setResumeText] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [keyPoints, setKeyPoints] = useState("");
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
        body: JSON.stringify({ resumeText, jobDescription, company, position, tone, length, keyPoints }),
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

  // Helper actions
  const handleEdit = () => setCoverLetter("");

  const handleRegenerate = async () => {
    const fakeEvent = { preventDefault: () => {} } as unknown as React.FormEvent;
    await handleSubmit(fakeEvent);
  };

  const handleCopy = async () => {
    if (!coverLetter) return;
    try {
      await navigator.clipboard.writeText(coverLetter);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const handleDownloadPDF = () => {
    const blob = new Blob([coverLetter], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover-letter.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDOCX = () => {
    const blob = new Blob([coverLetter], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover-letter.docx';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-700 mb-4">Generate a professional cover letter instantly after logging in. Your credentials are stored securely and your AI‑generated letters are private.</p>
        <a href="/login" className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Log In / Sign Up</a>
      </div>
    );
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
        {/* New fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
          <input
            type="text"
            value={company}
            onChange={e => setCompany(e.target.value)}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Acme Corp"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <input
            type="text"
            value={position}
            onChange={e => setPosition(e.target.value)}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Senior Engineer"
          />
        </div>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
            <select
              value={tone}
              onChange={e => setTone(e.target.value)}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option>Professional</option>
              <option>Enthusiastic</option>
              <option>Concise</option>
              <option>Friendly</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Length</label>
            <select
              value={length}
              onChange={e => setLength(e.target.value)}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option>Short</option>
              <option>Medium</option>
              <option>Long</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Key Points / Highlights</label>
          <textarea
            value={keyPoints}
            onChange={e => setKeyPoints(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="e.g., led a team of 5, increased sales by 20%"
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
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={handleEdit}>Edit</Button>
              <Button variant="secondary" size="sm" onClick={handleRegenerate}>Regenerate</Button>
              <Button variant="secondary" size="sm" onClick={handleCopy}>Copy</Button>
              <Button variant="secondary" size="sm" onClick={handleDownloadPDF}>Download PDF</Button>
              <Button variant="secondary" size="sm" onClick={handleDownloadDOCX}>Download DOCX</Button>
            </div>
        </div>
      )}
    </div>
  );
}
