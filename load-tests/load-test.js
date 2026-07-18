/**
 * Load Test — 30-minute sustained traffic
 *
 * Run: k6 run load-tests/load-test.js
 *
 * Simulates normal production traffic patterns.
 * Peak: 100 concurrent users.
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8000";

const errorRate = new Rate("errors");
const httpDuration = new Trend("http_duration", true);

export const options = {
  stages: [
    { duration: "2m", target: 20 },   // Ramp to 20
    { duration: "5m", target: 50 },   // Ramp to 50
    { duration: "10m", target: 100 }, // Peak: 100 users
    { duration: "5m", target: 100 },  // Sustain peak
    { duration: "5m", target: 50 },   // Cool down
    { duration: "3m", target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<3000", "p(99)<5000"],
    http_req_failed: ["rate<0.05"],
    errors: ["rate<0.05"],
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

const users = []; // Shared user pool

function getOrCreateUser() {
  if (users.length > 0 && Math.random() > 0.3) {
    return users[Math.floor(Math.random() * users.length)];
  }

  const email = `loadtest_${randomString(8)}@test.com`;
  const password = "TestPassword123!";

  let res = http.post(
    `${BASE_URL}/api/v1/auth/signup`,
    JSON.stringify({ name: "Load Test", email, password }),
    { headers: { "Content-Type": "application/json" } }
  );

  // Login regardless (signup may have failed with 409)
  res = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email, password }),
    { headers: { "Content-Type": "application/json" } }
  );

  if (res.status === 200) {
    const body = JSON.parse(res.body);
    const token = body.data?.access_token;
    if (token) {
      const user = { email, token };
      users.push(user);
      return user;
    }
  }
  return null;
}

export default function () {
  const user = getOrCreateUser();
  if (!user) {
    errorRate.add(true);
    return;
  }

  const headers = {
    Authorization: `Bearer ${user.token}`,
    "Content-Type": "application/json",
  };

  // Scenario: Mixed traffic
  const scenario = Math.random();

  if (scenario < 0.3) {
    // 30% — Dashboard
    const res = http.get(`${BASE_URL}/api/v1/resumes/dashboard`, { headers });
    check(res, { "dashboard 200": (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    httpDuration.add(res.timings.duration);
    sleep(Math.random() * 3 + 1);
  } else if (scenario < 0.5) {
    // 20% — Resume list
    const res = http.get(`${BASE_URL}/api/v1/resumes/`, { headers });
    check(res, { "resume list 200": (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    httpDuration.add(res.timings.duration);
    sleep(Math.random() * 2 + 1);
  } else if (scenario < 0.7) {
    // 20% — ATS history
    const res = http.get(`${BASE_URL}/api/v1/ats/history`, { headers });
    check(res, { "ats history 200": (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    httpDuration.add(res.timings.duration);
    sleep(Math.random() * 2 + 1);
  } else if (scenario < 0.85) {
    // 15% — AI settings
    const res = http.get(`${BASE_URL}/api/v1/settings/ai/providers`, { headers });
    check(res, { "ai settings 200": (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    httpDuration.add(res.timings.duration);
    sleep(Math.random() * 2 + 1);
  } else {
    // 15% — Refresh token
    const res = http.post(`${BASE_URL}/api/v1/auth/refresh`, null, {
      headers: { Cookie: `refresh_token=dummy` },
    });
    // Expected to fail (dummy token) — just testing the endpoint responds
    check(res, { "refresh responds": (r) => r.status === 401 || r.status === 200 });
    httpDuration.add(res.timings.duration);
    sleep(Math.random() * 5 + 2);
  }

  sleep(Math.random() * 2);
}

export function handleSummary(data) {
  const metrics = data.metrics;
  let output = "\n=== LOAD TEST RESULTS ===\n";
  output += `Total requests: ${metrics.http_reqs?.values?.count || 0}\n`;
  output += `Failed rate: ${((metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2)}%\n`;
  output += `Avg response: ${metrics.http_req_duration?.values?.avg?.toFixed(0) || 0}ms\n`;
  output += `P95 response: ${metrics.http_req_duration?.values?.["p(95)"]?.toFixed(0) || 0}ms\n`;
  output += `P99 response: ${metrics.http_req_duration?.values?.["p(99)"]?.toFixed(0) || 0}ms\n`;
  output += `Max response: ${metrics.http_req_duration?.values?.max?.toFixed(0) || 0}ms\n`;
  output += `RPS: ${metrics.http_reqs?.values?.rate?.toFixed(1) || 0}\n`;

  return {
    "load-tests/results/load-test-summary.json": JSON.stringify(data, null, 2),
    stdout: output,
  };
}
