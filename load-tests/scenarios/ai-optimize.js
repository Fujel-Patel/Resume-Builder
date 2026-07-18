/**
 * Scenario: AI Resume Optimization (SSE Streaming)
 *
 * Run: k6 run load-tests/scenarios/ai-optimize.js
 *
 * Tests the AI pipeline — the most expensive operation.
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8000";
const errorRate = new Rate("ai_errors");
const aiDuration = new Trend("ai_duration", true);

export const options = {
  vus: 5, // Very low — AI calls are expensive
  duration: "10m",
  thresholds: {
    ai_duration: ["p(95)<60000"], // 60s for AI calls
    ai_errors: ["rate<0.2"], // Higher threshold — AI may fail
  },
};

function randomString(len) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const tokens = [];

export function setup() {
  for (let i = 0; i < 3; i++) {
    const email = `ai_user_${i}@test.com`;
    http.post(
      `${BASE_URL}/api/v1/auth/signup`,
      JSON.stringify({ name: `AI User ${i}`, email, password: "TestPassword123!" }),
      { headers: { "Content-Type": "application/json" } }
    );
    const res = http.post(
      `${BASE_URL}/api/v1/auth/login`,
      JSON.stringify({ email, password: "TestPassword123!" }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (res.status === 200) {
      const body = JSON.parse(res.body);
      if (body.data?.access_token) tokens.push(body.data.access_token);
    }
  }
  return { tokens };
}

export default function (data) {
  const token = data.tokens[__VU % data.tokens.length];
  if (!token) return;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Create a resume first
  let res = http.post(
    `${BASE_URL}/api/v1/resumes/`,
    JSON.stringify({
      title: `AI Resume ${randomString(6)}`,
      template_id: "modern",
      content: {
        contact: { name: "AI User", email: "ai@test.com", phone: "555-0200" },
        experience: [
          {
            company: "Tech Inc",
            role: "Developer",
            startDate: "2021-06",
            endDate: "2024-06",
            description: "Developed software solutions and improved system performance.",
          },
        ],
        education: [],
        projects: [],
        skills: ["Python", "JavaScript", "SQL"],
      },
    }),
    { headers }
  );

  let resumeId = null;
  if (res.status === 201) {
    const body = JSON.parse(res.body);
    resumeId = body.data?.id;
  }

  if (!resumeId) {
    errorRate.add(true);
    return;
  }
  sleep(1);

  // Optimize with AI (the expensive SSE call)
  res = http.post(
    `${BASE_URL}/api/v1/ai/optimize-resume`,
    JSON.stringify({
      resume_id: resumeId,
      job_description:
        "Senior Software Engineer. Requirements: 5+ years experience, Python, JavaScript, SQL, cloud infrastructure, CI/CD, microservices.",
    }),
    { headers, timeout: "120s" }
  );

  aiDuration.add(res.timings.duration);
  check(res, {
    "AI optimize responds": (r) => r.status === 200 || r.status === 400,
    "AI optimize < 60s": (r) => r.timings.duration < 60000,
  });
  errorRate.add(res.status !== 200 && res.status !== 400);

  sleep(Math.random() * 10 + 5);
}
