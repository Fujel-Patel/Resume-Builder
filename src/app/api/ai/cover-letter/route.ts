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
      return NextResponse.json({ error: 'Resume text and job description are required' }, { status: 400 });
    }

    const model = getModel(getDefaultProvider());

    const prompt = `You are an expert cover letter writer. Write a professional, tailored cover letter based on the resume and job description provided. The cover letter should be compelling, highlight relevant experience, and match the tone of the job description. Return ONLY the cover letter text, no additional commentary.

Resume:
${resumeText}

Job Description:
${jobDescription}`;

    const result = await streamText({
      model,
      prompt,
      maxOutputTokens: 1500,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getDefaultProvider(): string {
  return process.env.DEFAULT_AI_PROVIDER ?? 'google';
}