/**
 * Scenario: Resume Creation + PDF Export
 *
 * Run: k6 run load-tests/scenarios/resume-create.js
 *
 * Tests the heavy PDF generation path (Playwright).
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8000";
const errorRate = new Rate("create_errors");
const createDuration = new Trend("create_duration", true);

export const options = {
  vus: 10, // Low VUs — this is the heavy path
  duration: "10m",
  thresholds: {
    create_duration: ["p(95)<30000"], // 30s for PDF generation
    create_errors: ["rate<0.1"],
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
  for (let i = 0; i < 5; i++) {
    const email = `create_user_${i}@test.com`;
    http.post(
      `${BASE_URL}/api/v1/auth/signup`,
      JSON.stringify({ name: `Creator ${i}`, email, password: "TestPassword123!" }),
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

  // Create resume
  let res = http.post(
    `${BASE_URL}/api/v1/resumes/`,
    JSON.stringify({
      title: `Resume ${randomString(6)}`,
      template_id: "modern",
      content: {
        contact: { name: "Test User", email: "test@test.com", phone: "555-0100" },
        experience: [
          {
            company: "Test Corp",
            role: "Engineer",
            startDate: "2022-01",
            endDate: "2024-01",
            description: "Built things",
          },
        ],
        education: [],
        projects: [],
        skills: ["JavaScript", "Python"],
      },
    }),
    { headers }
  );

  createDuration.add(res.timings.duration);
  errorRate.add(res.status !== 201);

  let resumeId = null;
  if (res.status === 201) {
    const body = JSON.parse(res.body);
    resumeId = body.data?.id;
  }
  check(res, { "resume created": () => resumeId !== null });
  sleep(2);

  // Export PDF (the heavy path)
  if (resumeId) {
    res = http.post(`${BASE_URL}/api/v1/resumes/${resumeId}/export/pdf`, null, {
      headers,
      timeout: "60s",
    });
    createDuration.add(res.timings.duration);
    check(res, {
      "PDF export 200": (r) => r.status === 200,
      "PDF export < 30s": (r) => r.timings.duration < 30000,
    });
    errorRate.add(res.status !== 200);
  }

  sleep(Math.random() * 5 + 3);
}
