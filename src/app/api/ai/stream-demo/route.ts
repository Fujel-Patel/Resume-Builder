// src/app/api/ai/stream-demo/route.ts
import { NextResponse } from "next/server";

export const runtime = "edge";

/**
 * Simple demo endpoint that streams a few text fragments.
 * It mimics the shape of the AI routes that use `streamText`.
 */
export async function GET() {
  const encoder = new TextEncoder();
  const parts = [
    "Generating...\n",
    "Step 1: analysing input...\n",
    "Step 2: creating content...\n",
    "Done.\n",
  ];

  const stream = new ReadableStream({
    async start(controller) {
      for (const part of parts) {
        controller.enqueue(encoder.encode(part));
        // Small delay to make the streaming effect visible
        await new Promise((res) => setTimeout(res, 500));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain" },
  });
}
