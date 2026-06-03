import { streamText } from 'ai';
import { getModel } from '@/lib/ai';
import { enforceAIRateLimit } from '@/lib/rate-limit-ai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const rateLimitResponse = await enforceAIRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { resumeText, targetRole } = await request.json();

    if (!resumeText) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
    }

    const model = getModel(getDefaultProvider());

    const prompt = `You are an expert resume writer. Improve the following resume to be more impactful and tailored for a ${targetRole || 'target role'} position. Make sure to keep the same format and sections, but enhance the language, quantify achievements where possible, and use strong action verbs. Return ONLY the improved resume text, no additional commentary.

Resume:
${resumeText}`;

    const result = await streamText({
      model,
      prompt,
      maxOutputTokens: 2000,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error improving resume:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getDefaultProvider(): string {
  return process.env.DEFAULT_AI_PROVIDER ?? 'google';
}