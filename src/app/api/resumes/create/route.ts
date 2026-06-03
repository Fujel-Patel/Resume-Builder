import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createResumeSchema = z.object({
  title: z.string().min(1),
  templateId: z.string().min(1),
  data: z.any(),
  userId: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createResumeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.format() }, { status: 400 });
    }
    const { title, templateId, data, userId } = parsed.data;

    const resume = await prisma.resume.create({
      data: {
        title,
        templateId,
        data,
        userId: userId ?? 'public',
      },
    });

    return NextResponse.json({ success: true, record: resume });
  } catch (err: any) {
    console.error('Resume save error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}