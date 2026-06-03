import { streamText } from 'ai';
import { getModel } from '@/lib/ai';
import { enforceAIRateLimit } from '@/lib/rate-limit-ai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const rateLimitResponse = await enforceAIRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { resumeText, jobDescription } = await request.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: 'Resume text and job description are required' },
        { status: 400 }
      );
    }

    const model = getModel(getDefaultProvider());

    const prompt = `You are an expert resume writer and ATS specialist. Rewrite the resume below to better match the job description, ensuring relevant keywords and phrases from the job description are naturally incorporated. Keep the same format and sections, but adjust the language to highlight the most relevant experience and skills. Return ONLY the optimized resume text, no additional commentary.

Resume:
${resumeText}

Job Description:
${jobDescription}`;

    const result = await streamText({
      model,
      prompt,
      maxOutputTokens: 4096,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error optimizing resume for ATS:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getDefaultProvider(): string {
  return process.env.DEFAULT_AI_PROVIDER ?? 'google';
}