import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { checkRateLimit } from '@/lib/rate-limit';

// Schema for updating a resume – all fields optional
const updateResumeSchema = z.object({
  title: z.string().min(1).optional(),
  templateId: z.string().min(1).optional(),
  data: z.any().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication removed – resume is publicly readable.
    const resume = await prisma.resume.findUnique({
      where: { id: params.id },
    });
    if (!resume) {
      return new NextResponse("Resume not found", { status: 404 });
    }
    return NextResponse.json(resume);
  } catch (error) {
    console.error("Error fetching resume:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication removed – any user can update this resume (publicly writable).
    const existing = await prisma.resume.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return new NextResponse("Resume not found", { status: 404 });
    }
    const body = await request.json();
    const parsed = updateResumeSchema.safeParse(body);
    if (!parsed.success) {
      return new NextResponse(JSON.stringify({ errors: parsed.error.format() }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const updated = await prisma.resume.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating resume:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication removed – any user can update this resume (publicly writable).
    const existing = await prisma.resume.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return new NextResponse("Resume not found", { status: 404 });
    }
    await prisma.resume.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting resume:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
