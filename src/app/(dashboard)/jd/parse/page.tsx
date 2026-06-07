"use client";

import { useState } from "react";
import type { ParsedJD, JDParseResponse } from "@/types/jd";
import { useToast } from "@/components/ui/ToastProvider";
import { useRouter } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import Button from "@/components/ui/Button";

type TabKey = "skills" | "keywords" | "responsibilities" | "details";

const TABS: { key: TabKey; label: string }[] = [
  { key: "skills", label: "Skills" },
  { key: "keywords", label: "Keywords" },
  { key: "responsibilities", label: "Responsibilities" },
  { key: "details", label: "Details" },
];

export default function JDParsePage() {
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParsedJD | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("skills");
  const { addToast } = useToast();
  const router = useRouter();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast({ title: "Copied", description: "Text copied to clipboard", variant: "default" });
  };

  const sendToBuilder = () => {
    const params = new URLSearchParams({ skills: result?.requiredSkills?.join(',') ?? '' });
    router.push(`/builder?${params.toString()}`);
    addToast({ title: "Sent", description: "Data sent to Resume Builder", variant: "default" });
  };

  const sendToOptimizer = () => {
    const params = new URLSearchParams({ jd: jdText });
    router.push(`/ats/optimize?${params.toString()}`);
    addToast({ title: "Sent", description: "Data sent to ATS Optimizer", variant: "default" });
  };

  const handleExtract = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/jd/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobDescription: jdText }),
      });

      const data = (await res.json()) as JDParseResponse;

      if (!res.ok || !data.success || !data.data) {
        setError(data.error ?? "Failed to parse job description.");
        return;
      }

      setResult(data.data);
      setActiveTab("skills");
    } catch (err) {
      setError("Unexpected error while calling the extraction API.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    setJdText(
      "We are looking for a Senior Full Stack Engineer to join our growing team. You will build and maintain scalable web applications using React, TypeScript, and Node.js. The ideal candidate has 4+ years of experience with modern frontend frameworks, REST API design, and cloud platforms such as AWS or GCP. Familiarity with CI/CD pipelines, Docker, and PostgreSQL is preferred. You will collaborate with designers, QA engineers, and product managers to ship high-quality features. Strong communication and problem-solving skills are essential. B.Tech/B.E. in Computer Science or related field is required."
    );
  };

  const handleClear = () => {
    setJdText("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">JD Keyword Extraction</h1>
          <p className="mt-2 text-gray-600">
            Paste a job description and extract skills, keywords, and requirements automatically.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <label className="block text-sm font-medium text-gray-700">
              Job Description
            </label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full job description here..."
              className="h-72 w-full rounded-lg border border-gray-300 p-4 text-sm focus:border-blue-500 focus:outline-none"
            />
            <div className="text-sm text-gray-500 mt-1">
                  {jdText.length} characters (minimum 20 required)
                </div>
                <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleExtract}
                disabled={loading || jdText.trim().length < 20}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Extracting..." : "Extract Keywords"}
              </button>
              <button
                type="button"
                onClick={handleLoadSample}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Load Sample JD
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {!result && !error && (
              <div className="flex h-64 items-center justify-center text-sm text-gray-500">
                Extraction results will appear here.
              </div>
            )}

            {result && (
              <div className="space-y-5">
          {/* Action buttons to send data to other parts of the app */}
          <div className="flex space-x-4 justify-center mt-4">
            <Button variant="primary" size="lg" onClick={sendToBuilder}>Send to Resume Builder</Button>
            <Button variant="secondary" size="lg" onClick={sendToOptimizer}>Send to ATS Optimizer</Button>
          </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">Extracted Insights</h2>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    AI-assisted extraction
                  </span>
                </div>

                <div className="flex gap-2 border-b border-gray-200">
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
                        activeTab === tab.key
                          ? "border-b-2 border-blue-600 text-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === "skills" && (
                  <div className="space-y-4">
                    <SkillSection
                      title="Required Skills"
                      skills={result.requiredSkills}
                      tone="red"
                    />
                    <SkillSection
                      title="Preferred Skills"
                      skills={result.preferredSkills}
                      tone="amber"
                    />
                    <SkillSection
                      title="Certifications"
                      skills={result.certifications ?? []}
                      tone="emerald"
                    />
                  </div>
                )}

                {activeTab === "keywords" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-800">Keywords</h3>
                      {result.keywords.length > 0 && (
                        <Button variant="secondary" size="sm" onClick={() => {
                          navigator.clipboard.writeText(result.keywords.join(", "));
                          addToast({ title: "Copied", description: "All keywords copied", variant: "default" });
                        }}>Copy All</Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.map((keyword) => (
                        <KeywordBadge key={keyword} text={keyword} />
                      ))}
                    </div>
                    {result.keywords.length === 0 && (
                      <p className="text-sm text-gray-500">No keywords extracted.</p>
                    )}
                  </div>
                )}

                {activeTab === "responsibilities" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-800">Responsibilities</h3>
                      {result.responsibilities.length > 0 && (
                        <Button variant="secondary" size="sm" onClick={() => {
                          navigator.clipboard.writeText(result.responsibilities.join(", "));
                          addToast({ title: "Copied", description: "All responsibilities copied", variant: "default" });
                        }}>Copy All</Button>
                      )}
                    </div>
                    <ul className="space-y-2">
                      {result.responsibilities.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                      {result.responsibilities.length === 0 && (
                        <p className="text-sm text-gray-500">No responsibilities extracted.</p>
                      )}
                    </ul>
                  </div>
                )}

                {activeTab === "details" && (
                  <div className="space-y-3 text-sm text-gray-700">
                    <DetailRow label="Title" value={result.title} />
                    <DetailRow label="Company" value={result.company} />
                    <DetailRow label="Experience Level" value={result.experienceLevel} />
                    <DetailRow label="Education" value={result.educationRequirements} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkillSection({
  title,
  skills,
  tone,
}: {
  title: string;
  skills: string[];
  tone: "red" | "amber" | "emerald";
}) {
  const toneClasses: Record<string, string> = {
    red: "border-red-200 bg-red-50 text-red-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };

  const { addToast } = useToast();

  const copyAll = () => {
    const text = skills.join(", ");
    navigator.clipboard.writeText(text);
    addToast({ title: "Copied", description: "All skills copied to clipboard", variant: "default" });
  };

  const maxLen = Math.max(...skills.map((s) => s.length), 1);

  return (
    <div className="rounded-lg border p-4" style={{ borderColor: tone === "red" ? "#fecaca" : tone === "amber" ? "#fde68a" : "#a7f3d0", backgroundColor: tone === "red" ? "#fef2f2" : tone === "amber" ? "#fffbeb" : "#ecfdf5" }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        {skills.length > 0 && (
          <Button variant="secondary" size="sm" onClick={copyAll}>Copy All</Button>
        )}
      </div>
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <div key={skill} className="flex items-center gap-1">
              <span className={`rounded-full border px-3 py-1 text-xs font-medium ${toneClasses[tone]}`}>{skill}</span>
              <button type="button" onClick={() => navigator.clipboard.writeText(skill)} className="ml-1 text-gray-500 hover:text-gray-700">
                <CheckCircleIcon className="h-4 w-4" />
              </button>
              <div className="h-1 flex-1 bg-gray-200 rounded" style={{ width: `${(skill.length / maxLen) * 100}%` }}></div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">None extracted.</p>
      )}
    </div>
  );
}

function KeywordBadge({ text }: { text: string }) {
  // Simple visual indicator: width based on text length (placeholder for frequency)
  const maxLen = 30; // arbitrary max for scaling
  const widthPct = Math.min(100, (text.length / maxLen) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
        {text}
      </span>
      <div className="h-1 flex-1 bg-blue-200 rounded" style={{ width: `${widthPct}%` }}></div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <span className="font-medium text-gray-900">{label}: </span>
      <span className="text-gray-700">{value || "—"}</span>
    </div>
  );
}
