import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for creating a resume
const createResumeSchema = z.object({
  title: z.string().min(1),
  templateId: z.string().min(1),
  data: z.any(),
});

import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  try {
    // Authentication removed – all resumes are publicly readable.
    // Rate limiting omitted for open access.
    const resumes = await prisma.resume.findMany({
      select: {
        id: true,
        title: true,
        templateId: true,
        data: true,
        createdAt: true,
        updatedAt: true,
        isPublic: true,
        fileUrl: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(resumes);
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Authentication removed – all resumes are publicly readable.
    // Rate limiting omitted for open access.
    const body = await request.json();
    const parsed = createResumeSchema.safeParse(body);
    if (!parsed.success) {
      return new NextResponse(JSON.stringify({ errors: parsed.error.format() }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { title, templateId, data } = parsed.data;
    const resume = await prisma.resume.create({
      data: {
        userId: "public",
        title,
        templateId,
        data,
      },
    });
    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    console.error("Error creating resume:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
