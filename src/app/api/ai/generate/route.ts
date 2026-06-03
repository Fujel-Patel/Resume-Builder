import { streamText } from 'ai';
import { getModel } from '@/lib/ai';
import { enforceAIRateLimit } from '@/lib/rate-limit-ai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const rateLimitResponse = await enforceAIRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const model = getModel(getDefaultProvider());
    const result = await streamText({
      model,
      prompt,
      maxOutputTokens: 1000,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error generating text:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getDefaultProvider(): string {
  return process.env.DEFAULT_AI_PROVIDER ?? 'google';
}