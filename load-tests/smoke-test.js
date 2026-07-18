/**
 * Smoke Test — 5-minute baseline validation
 *
 * Run: k6 run load-tests/smoke-test.js
 *
 * Validates basic functionality before heavier load tests.
 * Simulates: 5 concurrent users for 5 minutes.
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8000";

const errorRate = new Rate("errors");
const httpDuration = new Trend("http_duration", true);

export const options = {
  stages: [
    { duration: "30s", target: 5 },   // Ramp up
    { duration: "3m", target: 5 },    // Steady state
    { duration: "30s", target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<3000"],
    http_req_failed: ["rate<0.1"],
    errors: ["rate<0.1"],
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

export default function () {
  // Health check
  let res = http.get(`${BASE_URL}/health`);
  check(res, {
    "health status 200": (r) => r.status === 200,
    "health response time < 500ms": (r) => r.timings.duration < 500,
  });
  errorRate.add(res.status !== 200);
  httpDuration.add(res.timings.duration);
  sleep(1);

  // Signup (may fail with duplicate email, that's OK)
  const email = `loadtest_${randomString(8)}@test.com`;
  res = http.post(
    `${BASE_URL}/api/v1/auth/signup`,
    JSON.stringify({
      name: "Load Test User",
      email: email,
      password: "TestPassword123!",
    }),
    { headers: { "Content-Type": "application/json" } }
  );
  const signupOk = res.status === 201 || res.status === 409;
  check(res, {
    "signup 201 or 409": () => signupOk,
  });
  errorRate.add(!signupOk);
  httpDuration.add(res.timings.duration);
  sleep(1);

  // Login
  res = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({
      email: email,
      password: "TestPassword123!",
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  let accessToken = null;
  if (res.status === 200) {
    const body = JSON.parse(res.body);
    accessToken = body.data?.access_token;
  }

  check(res, {
    "login status 200": (r) => r.status === 200,
    "login returns access_token": () => accessToken !== null,
  });
  errorRate.add(res.status !== 200);
  httpDuration.add(res.timings.duration);
  sleep(1);

  // Dashboard (authenticated)
  if (accessToken) {
    const authHeaders = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    res = http.get(`${BASE_URL}/api/v1/resumes/dashboard`, {
      headers: authHeaders,
    });
    check(res, {
      "dashboard status 200": (r) => r.status === 200,
      "dashboard response time < 2s": (r) => r.timings.duration < 2000,
    });
    errorRate.add(res.status !== 200);
    httpDuration.add(res.timings.duration);
    sleep(2);

    // List resumes
    res = http.get(`${BASE_URL}/api/v1/resumes/`, {
      headers: authHeaders,
    });
    check(res, {
      "resume list status 200": (r) => r.status === 200,
    });
    errorRate.add(res.status !== 200);
    httpDuration.add(res.timings.duration);
    sleep(1);
  }

  sleep(Math.random() * 3 + 1); // Random think time
}

export function handleSummary(data) {
  return {
    "load-tests/results/smoke-test-summary.json": JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: "  ", enableColors: true }),
  };
}

function textSummary(data, opts) {
  // Simplified summary output
  const metrics = data.metrics;
  let output = "\n=== SMOKE TEST RESULTS ===\n";
  output += `Total requests: ${metrics.http_reqs?.values?.count || 0}\n`;
  output += `Failed: ${metrics.http_req_failed?.values?.rate?.toFixed(2) || 0}%\n`;
  output += `Avg response: ${metrics.http_req_duration?.values?.avg?.toFixed(0) || 0}ms\n`;
  output += `P95 response: ${metrics.http_req_duration?.values?.["p(95)"]?.toFixed(0) || 0}ms\n`;
  output += `P99 response: ${metrics.http_req_duration?.values?.["p(99)"]?.toFixed(0) || 0}ms\n`;
  return output;
}
