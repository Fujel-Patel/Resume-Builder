import { streamText } from 'ai';
import { getModel } from '@/lib/ai';
import { enforceAIRateLimit } from '@/lib/rate-limit-ai';
import { NextResponse } from 'next/server';
import type { ResumeData } from '@/types/resume';

// Validation constants
const VALIDATION_LIMITS = {
  MAX_STRING_LENGTH: 500,
  MAX_ARRAY_ITEMS: 20,
} as const;

/**
 * Validate resume data for AI generation to prevent abuse
 */
function validateResumeDataForAI(data: Partial<ResumeData>): { valid: boolean; error?: string } {
  if (!data) {
    return { valid: false, error: 'No resume data provided' };
  }

  // Validate contact information if present
  if (data.contact && typeof data.contact === 'object') {
    const contactFields = ['name', 'email', 'phone', 'location'];
    for (const field of contactFields) {
      const value = (data.contact as any)[field];
      if (value && typeof value === 'string' && value.length > VALIDATION_LIMITS.MAX_STRING_LENGTH) {
        return { valid: false, error: `Contact ${field} exceeds maximum length` };
      }
    }
  }

  // Validate summary
  if (data.summary && typeof data.summary === 'string' && data.summary.length > VALIDATION_LIMITS.MAX_STRING_LENGTH) {
    return { valid: false, error: 'Summary exceeds maximum length' };
  }

  // Validate skills array
  if (data.skills && Array.isArray(data.skills)) {
    if (data.skills.length > VALIDATION_LIMITS.MAX_ARRAY_ITEMS) {
      return { valid: false, error: `Too many skills provided (max ${VALIDATION_LIMITS.MAX_ARRAY_ITEMS})` };
    }

    for (let i = 0; i < data.skills.length; i++) {
      const skill: unknown = data.skills[i];
      if (skill && typeof skill === 'object' && 'name' in skill && typeof skill.name === 'string' && skill.name.length > VALIDATION_LIMITS.MAX_STRING_LENGTH) {
        return { valid: false, error: `Skill ${i}.name exceeds maximum length` };
      }
      if (typeof skill === 'string' && skill.length > VALIDATION_LIMITS.MAX_STRING_LENGTH) {
        return { valid: false, error: `Skill ${i} exceeds maximum length` };
      }
    }
  }

  // Validate experience array
  if (data.experience && Array.isArray(data.experience)) {
    if (data.experience.length > VALIDATION_LIMITS.MAX_ARRAY_ITEMS) {
      return { valid: false, error: `Too many experience entries (max ${VALIDATION_LIMITS.MAX_ARRAY_ITEMS})` };
    }

    for (let i = 0; i < data.experience.length; i++) {
      const exp = data.experience[i];
      if (!exp || typeof exp !== 'object') {
        return { valid: false, error: `Invalid experience entry at index ${i}` };
      }

      const expFields = ['role', 'company', 'description'];
      for (const field of expFields) {
        const value = (exp as any)[field];
        if (value && typeof value === 'string' && value.length > VALIDATION_LIMITS.MAX_STRING_LENGTH) {
          return { valid: false, error: `Experience ${i}.${field} exceeds maximum length` };
        }
      }

      // Validate bullets if present
      if (exp.bullets && Array.isArray(exp.bullets)) {
        if (exp.bullets.length > VALIDATION_LIMITS.MAX_ARRAY_ITEMS) {
          return { valid: false, error: `Experience ${i} has too many bullets (max ${VALIDATION_LIMITS.MAX_ARRAY_ITEMS})` };
        }
        for (let j = 0; j < exp.bullets.length; j++) {
          const bullet = exp.bullets[j];
          if (bullet && typeof bullet === 'string' && bullet.length > VALIDATION_LIMITS.MAX_STRING_LENGTH) {
            return { valid: false, error: `Experience ${i}.bullet ${j} exceeds maximum length` };
          }
        }
      }
    }
  }

  // Validate education array
  if (data.education && Array.isArray(data.education)) {
    if (data.education.length > VALIDATION_LIMITS.MAX_ARRAY_ITEMS) {
      return { valid: false, error: `Too many education entries (max ${VALIDATION_LIMITS.MAX_ARRAY_ITEMS})` };
    }

    for (let i = 0; i < data.education.length; i++) {
      const edu = data.education[i];
      if (!edu || typeof edu !== 'object') {
        return { valid: false, error: `Invalid education entry at index ${i}` };
      }

      const eduFields = ['degree', 'institution'];
      for (const field of eduFields) {
        const value = (edu as any)[field];
        if (value && typeof value === 'string' && value.length > VALIDATION_LIMITS.MAX_STRING_LENGTH) {
          return { valid: false, error: `Education ${i}.${field} exceeds maximum length` };
        }
      }
    }
  }

  return { valid: true };
}

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await enforceAIRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { resumeData } = body;

    // Validate resume data
    const validationResult = validateResumeDataForAI(resumeData);
    if (!validationResult.valid) {
      return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    if (!resumeData) {
      return NextResponse.json({ error: 'resumeData is required' }, { status: 400 });
    }

    const prompt = buildPrompt(resumeData);
    const model = getModel(getDefaultProvider());

    // Create abort controller for handling client disconnects
    const abortController = new AbortController();

    // Handle request cancellation
    const originalRequest = request as Request & { signal?: AbortSignal };
    if (originalRequest.signal) {
      originalRequest.signal.addEventListener('abort', () => {
        abortController.abort();
      });
    }

    try {
      const result = await streamText({
        model,
        prompt,
        maxOutputTokens: 2000,
        temperature: 0.7,
        // Note: AI SDK streamText doesn't directly accept signal,
        // but we can handle abortions at the response level
      });

      // Create a readable stream that respects abort signals
      const stream = new ReadableStream({
        async start(controller) {
          const reader = result.textStream.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              // Check if client has disconnected
              if (abortController.signal.aborted) {
                reader.cancel();
                break;
              }

              controller.enqueue(value);
            }
          } catch (error) {
            if (abortController.signal.aborted) {
              // Client disconnected, this is expected
              controller.close();
              return;
            }
            controller.error(error);
          } finally {
            reader.releaseLock();
          }
        },
        cancel() {
          // Handle client disconnection
          abortController.abort();
        }
      });

      return new Response(stream, {
        headers: { 'Content-Type': 'text/plain' },
      });
    } catch (streamError) {
      // Handle stream-specific errors
      if (abortController.signal.aborted) {
        // Client disconnected - return 499 (Client Closed Request) or just end response
        return new Response(null, { status: 499 }); // Or 204 No Content
      }
      throw streamError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('Error generating resume:', error);

    // Provide more detailed error messages in development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        error: 'Failed to generate resume',
        details: error instanceof Error ? error.message : String(error),
        // Include stack trace in development only
        ...(error instanceof Error && { stack: error.stack })
      }, { status: 500 });
    }

    return NextResponse.json({ error: 'Failed to generate resume' }, { status: 500 });
  }
}

function getDefaultProvider(): string {
  return process.env.DEFAULT_AI_PROVIDER ?? 'google';
}

function buildPrompt(data: any): string {
  const { contact, experience, education, skills, summary } = data;
  const contactSection = contact
    ? `Name: ${contact.name}\nEmail: ${contact.email}\nPhone: ${contact.phone ?? 'N/A'}`
    : '';
  const skillsSection = skills?.length
    ? `Skills: ${skills.map((s: any) => s.name ?? s).join(', ')}`
    : '';
  const summarySection = summary ? `Professional Summary:\n${summary}` : '';
  const experienceSection = experience?.length
    ? `Experience:\n${experience.map((exp: any) => `- ${exp.role ?? exp.title} at ${exp.company} (${exp.startDate ?? exp.duration ?? 'N/A'} - ${exp.endDate ?? 'Present'})\n${exp.description ?? exp.bullets?.join('\n') ?? ''}`).join('\n')}`
    : '';
  const educationSection = education?.length
    ? `Education:\n${education.map((edu: any) => `- ${edu.degree} at ${edu.institution} (${edu.year ?? ''}${edu.gpa ? `, GPA ${edu.gpa}` : ''})`).join('\n')}`
    : '';

  return `You are an expert resume writer. Produce a polished, ATS-friendly resume based on the following information. Return ONLY the final resume text, no extra commentary.

${contactSection}

${summarySection}

${skillsSection}

${experienceSection}

${educationSection}`;
}