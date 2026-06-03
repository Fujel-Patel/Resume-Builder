import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for updating a resume draft
const updateDraftSchema = z.object({
  title: z.string().optional(),
  templateId: z.string().optional(),
  data: z.any().optional(),
});

export async function POST(request: Request) {
  try {
    const { title, templateId } = await request.json().catch(() => ({}));

    const titleStr = typeof title === 'string' && title.trim().length > 0
      ? title.trim()
      : 'Untitled Resume';

    const resume = await prisma.resume.create({
      data: {
        title: titleStr,
        templateId: templateId ?? null,
        data: {},
        userId: 'public',
      },
      select: {
        id: true,
        data: true,
        title: true,
        templateId: true,
      },
    });

    return NextResponse.json({ id: resume.id, data: resume.data });
  } catch (err: any) {
    console.error('Draft creation error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing draft id' }, { status: 400 });
  }

  try {
    const resume = await prisma.resume.findUnique({
      where: { id },
      select: { id: true, data: true },
    });

    if (!resume) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    return NextResponse.json({ id: resume.id, data: resume.data });
  } catch (err: any) {
    console.error('Draft fetch error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing draft id' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = updateDraftSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
    }

    const existing = await prisma.resume.findUnique({
      where: { id },
      select: { data: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    const mergedData = { ...(existing.data as Record<string, unknown>), ...parsed.data };

    const updated = await prisma.resume.update({
      where: { id },
      data: {
        ...(parsed.data.title ? { title: parsed.data.title } : {}),
        ...(parsed.data.templateId ? { templateId: parsed.data.templateId } : {}),
        data: mergedData,
      },
      select: { id: true, data: true },
    });

    return NextResponse.json({ id: updated.id, data: updated.data });
  } catch (err: any) {
    console.error('Draft update error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}