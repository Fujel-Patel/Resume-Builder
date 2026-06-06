export async function POST(request: Request) {
  // Parse JSON body – expects prompt, temperature, length (ignored for mock)
  const { prompt = "", temperature = 0.7, length = "medium" } = await request.json();

  const encoder = new TextEncoder();
  const mockResponse = `Mock response for prompt: "${prompt}" with temperature ${temperature} and length ${length}.`;

  // Stream response chunk by chunk to simulate real‑time generation
  const stream = new ReadableStream({
    async start(controller) {
      const words = mockResponse.split(/\s+/);
      for (let i = 0; i < words.length; i++) {
        const chunk = words[i] + (i < words.length - 1 ? " " : "");
        controller.enqueue(encoder.encode(chunk));
        // Simulate network latency / generation time
        await new Promise((r) => setTimeout(r, 200));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
