// src/app/(dashboard)/ai-demo/page.tsx
import { StreamingText } from "@/components/ai";

export default function AIDemoPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">AI Streaming Demo</h1>
      <StreamingText url="/api/ai/stream-demo" />
    </main>
  );
}
