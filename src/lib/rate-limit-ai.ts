import { NextResponse } from "next/server";
import { checkRateLimitByIP } from "./rate-limit";

const AI_RATE_LIMIT = {
  max: 20,
  windowMs: 60_000,
};

export async function enforceAIRateLimit(request: Request) {
  // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2..."
  // The leftmost entry is the original client IP in most proxy configurations.
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || "unknown";

  const result = await checkRateLimitByIP(ip, AI_RATE_LIMIT);
  if (!result.ok) {
    const retryAfterSec = Math.ceil(result.retryAfterMs / 1000);
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        retryAfter: retryAfterSec,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Limit": String(AI_RATE_LIMIT.max),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return null; // no block
}
