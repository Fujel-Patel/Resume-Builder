/**
 * Scenario: ATS Analysis
 *
 * Run: k6 run load-tests/scenarios/ats-analysis.js
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8000";
const errorRate = new Rate("ats_errors");
const atsDuration = new Trend("ats_duration", true);

export const options = {
  vus: 10,
  duration: "10m",
  thresholds: {
    atsDuration: ["p(95)<60000"],
    ats_errors: ["rate<0.15"],
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
    const email = `ats_user_${i}@test.com`;
    http.post(
      `${BASE_URL}/api/v1/auth/signup`,
      JSON.stringify({ name: `ATS User ${i}`, email, password: "TestPassword123!" }),
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
      title: `ATS Resume ${randomString(6)}`,
      template_id: "modern",
      content: {
        contact: { name: "ATS User", email: "ats@test.com", phone: "555-0300" },
        experience: [
          {
            company: "Startup Co",
            role: "Full Stack Developer",
            startDate: "2020-01",
            endDate: "2024-01",
            description: "Built and maintained web applications using React and Python.",
          },
        ],
        education: [],
        projects: [],
        skills: ["React", "Python", "PostgreSQL"],
      },
    }),
    { headers }
  );

  let resumeId = null;
  if (res.status === 201) {
    const body = JSON.parse(res.body);
    resumeId = body.data?.id;
  }
  sleep(1);

  if (resumeId) {
    // Score resume
    res = http.post(
      `${BASE_URL}/api/v1/ats/score`,
      JSON.stringify({
        resume_id: resumeId,
        job_description:
          "Looking for a Full Stack Developer with React, Python, and PostgreSQL experience. Must have CI/CD knowledge.",
      }),
      { headers, timeout: "120s" }
    );
    atsDuration.add(res.timings.duration);
    check(res, {
      "ATS score responds": (r) => r.status === 200 || r.status === 400,
      "ATS score < 60s": (r) => r.timings.duration < 60000,
    });
    errorRate.add(res.status !== 200 && res.status !== 400);
  }

  sleep(Math.random() * 5 + 3);
}
