"use client";

import { useState, useEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/ToastProvider";

// Example prompts
const EXAMPLE_PROMPTS = [
  "Write a concise summary for a software engineer with 5 years experience.",
  "Generate a cover letter for a senior product manager applying to a fintech startup.",
  "Create a bullet‑point list of key achievements for a data scientist.",
];

export default function AIDemoPage() {
  const { addToast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [length, setLength] = useState("medium");
  const [output, setOutput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speed, setSpeed] = useState(0); // chars per second
  const startTimeRef = useRef<number>(0);

  const model = process.env.DEFAULT_AI_PROVIDER || "mock-model";

  const handleLoadExample = (example: string) => {
    setPrompt(example);
  };

  const startStream = async (reusePrompt?: string) => {
    const payload = {
      prompt: reusePrompt ?? prompt,
      temperature,
      length,
    };
    setOutput("");
    setError(null);
    setStreaming(true);
    startTimeRef.current = Date.now();
    try {
      const response = await fetch("/api/ai/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      if (!response.body) {
        throw new Error("No streaming body returned.");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let chars = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        chars += chunk.length;
        setOutput((prev) => prev + chunk);
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setSpeed(chars / elapsed);
      }
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
      addToast({
        message: `AI request failed: ${e.message}`,
        variant: "error",
        action: { label: "Retry", onClick: () => startStream() },
      });
    } finally {
      setStreaming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startStream();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    addToast({ message: "Copied to clipboard", variant: "success" });
  };

  const handleRegenerate = () => {
    startStream(prompt);
  };

  const handleShare = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("prompt", encodeURIComponent(prompt));
    await navigator.clipboard.writeText(url.toString());
    addToast({ message: "Shareable link copied", variant: "success" });
  };

  // Load prompt from query string if present (shared link)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qp = params.get("prompt");
    if (qp) setPrompt(decodeURIComponent(qp));
  }, []);

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Demo</h1>

      {/* Prompt input and examples */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="prompt">
            Prompt
          </label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            rows={4}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((ex) => (
              <Button key={ex} type="button" variant="secondary" size="sm" onClick={() => handleLoadExample(ex)}>
                {ex}
              </Button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1" htmlFor="temperature">
              Temperature: {temperature}
            </label>
            <input
              id="temperature"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1" htmlFor="length">
              Length
            </label>
            <select
              id="length"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
          <div className="flex items-center">
            <span className="px-2 py-1 bg-gray-800 text-white rounded">{model}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button type="submit" variant="primary" loading={streaming} disabled={streaming || !prompt.trim()}>
            Generate
          </Button>
          {output && (
            <>
              <Button type="button" variant="secondary" onClick={handleCopy}>
                Copy
              </Button>
              <Button type="button" variant="secondary" onClick={handleRegenerate} disabled={streaming}>
                Regenerate
              </Button>
              <Button type="button" variant="secondary" onClick={handleShare}>
                Share
              </Button>
            </>
          )}
        </div>

        {/* Output area */}
        <div className="mt-4">
          {streaming && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <span className="animate-pulse">Generating…</span>
              <span>| {speed.toFixed(1)} chars/s</span>
            </div>
          )}
          {error && <div className="text-red-600 text-sm mb-2">Error: {error}</div>}
          {output && (
            <pre className="whitespace-pre-wrap p-4 bg-gray-100 rounded border border-gray-200">
              {output}
            </pre>
          )}
        </div>
      </form>
    </main>
  );
}
