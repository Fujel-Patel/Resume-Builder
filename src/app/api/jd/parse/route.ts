import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getModel, getDefaultProvider } from "@/lib/ai";
import { buildJDExtractionPrompt } from "@/lib/prompts/jd-extraction";
import { ParsedJDSchema, type ParsedJDOutput } from "@/lib/prompts/jd-extraction";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobDescription } = body as { jobDescription?: string };

    if (!jobDescription || typeof jobDescription !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Missing or invalid 'jobDescription' field.",
        },
        { status: 400 }
      );
    }

    const trimmed = jobDescription.trim();
    if (trimmed.length < 50) {
      return NextResponse.json(
        {
          success: false,
          error: "Job description is too short to analyze.",
        },
        { status: 400 }
      );
    }

    const provider = getDefaultProvider();
    const model = getModel(provider);
    const prompt = buildJDExtractionPrompt(trimmed);

    let rawText: string;
    try {
      const result = await generateText({
        model,
        prompt,
        temperature: 0.2,
        maxOutputTokens: 2048,
      });
      rawText = result.text.trim();
    } catch (error) {
      console.error("JD extraction AI error", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to extract structured data from the job description.",
          provider,
        },
        { status: 500 }
      );
    }

    const parsed = parseJDExtractionOutput(rawText);
    if (!parsed) {
      return NextResponse.json(
        {
          success: false,
          error: "AI returned an invalid structure for the job description.",
          provider,
          rawSnippet: rawText.slice(0, 500),
        },
        { status: 422 }
      );
    }

    const response = {
      success: true,
      data: {
        ...parsed,
        rawText: trimmed,
      },
      provider,
      model: provider,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("JD parse route error", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected server error while parsing job description.",
      },
      { status: 500 }
    );
  }
}

function parseJDExtractionOutput(raw: string): ParsedJDOutput | null {
  const trimmed = raw.trim();

  if (trimmed.startsWith("```")) {
    const withoutFences = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    const jsonCandidate = withoutFences.trim();
    return tryParseJSON(jsonCandidate);
  }

  return tryParseJSON(trimmed);
}

function tryParseJSON(candidate: string): ParsedJDOutput | null {
  try {
    const parsed = JSON.parse(candidate);
    const schemaResult = ParsedJDSchema.safeParse(parsed);
    return schemaResult.success ? schemaResult.data : null;
  } catch {
    return null;
  }
}
