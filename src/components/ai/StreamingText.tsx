// src/components/ai/StreamingText.tsx
"use client";

import { useEffect, useState } from "react";

export interface StreamingTextProps {
  /** Absolute or relative URL to the streaming endpoint */
  url: string;
  /** Payload sent with a POST request. If omitted, a GET request is used */
  payload?: any;
  /** Optional callback fired when the stream finishes */
  onComplete?: (fullText: string) => void;
}

/**
 * A reusable client‑side component that streams text from an API endpoint.
 * It works with the Vercel AI SDK streaming responses (plain text) and displays
 * the incoming chunks in a type‑writer‑like fashion.
 */
export function StreamingText({ url, payload, onComplete }: StreamingTextProps) {
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    const fetchStream = async () => {
      try {
        const response = await fetch(url, {
          method: payload ? "POST" : "GET",
          headers: {
            "Content-Type": "application/json",
          },
          body: payload ? JSON.stringify(payload) : undefined,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        if (!response.body) {
          throw new Error("Response does not contain a readable stream.");
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (aborted) {
            reader.cancel();
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
          setText((prev) => prev + chunk);
        }
        setLoading(false);
        onComplete?.(text + "");
      } catch (e: any) {
        setError(e.message ?? "Unknown error");
        setLoading(false);
      }
    };
    fetchStream();
    return () => {
      aborted = true;
    };
  }, [url, JSON.stringify(payload)]);

  return (
    <div className="border rounded p-4 bg-gray-50 overflow-auto min-h-[200px] font-mono whitespace-pre-wrap" aria-live="polite" role="status">
      {loading && (
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-5 h-5 border-2 border-t-transparent border-gray-500 rounded-full animate-spin motion-reduce:animate-none" role="status" aria-label="Loading" />
          <span className="text-sm text-gray-600">Loading…</span>
        </div>
      )}
      {error && (
        <p className="text-red-600 text-sm">Error: {error}</p>
      )}
      <pre className="whitespace-pre-wrap">{text}</pre>
    </div>
  );
}
