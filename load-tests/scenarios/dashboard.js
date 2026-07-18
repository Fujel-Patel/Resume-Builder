/**
 * Scenario: Dashboard — Browse resumes, view ATS history
 *
 * Run: k6 run load-tests/scenarios/dashboard.js
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8000";
const errorRate = new Rate("dash_errors");
const dashDuration = new Trend("dash_duration", true);

export const options = {
  vus: 100,
  duration: "10m",
  thresholds: {
    dash_duration: ["p(95)<2000"],
    dash_errors: ["rate<0.05"],
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

// Pre-authenticate users
const tokens = [];

export function setup() {
  for (let i = 0; i < 50; i++) {
    const email = `dash_user_${i}@test.com`;
    http.post(
      `${BASE_URL}/api/v1/auth/signup`,
      JSON.stringify({ name: `User ${i}`, email, password: "TestPassword123!" }),
      { headers: { "Content-Type": "application/json" } }
    );
    const res = http.post(
      `${BASE_URL}/api/v1/auth/login`,
      JSON.stringify({ email, password: "TestPassword123!" }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (res.status === 200) {
      const body = JSON.parse(res.body);
      if (body.data?.access_token) {
        tokens.push(body.data.access_token);
      }
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

  // Dashboard
  let res = http.get(`${BASE_URL}/api/v1/resumes/dashboard`, { headers });
  check(res, { "dashboard 200": (r) => r.status === 200 });
  dashDuration.add(res.timings.duration);
  errorRate.add(res.status !== 200);
  sleep(Math.random() * 3 + 1);

  // Resume list
  res = http.get(`${BASE_URL}/api/v1/resumes/`, { headers });
  check(res, { "resume list 200": (r) => r.status === 200 });
  dashDuration.add(res.timings.duration);
  errorRate.add(res.status !== 200);
  sleep(Math.random() * 2 + 1);

  // ATS history
  res = http.get(`${BASE_URL}/api/v1/ats/history`, { headers });
  check(res, { "ats history 200": (r) => r.status === 200 });
  dashDuration.add(res.timings.duration);
  errorRate.add(res.status !== 200);
  sleep(Math.random() * 2);
}
