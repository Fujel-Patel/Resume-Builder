/**
 * Stress Test — Find the breaking point
 *
 * Run: k6 run load-tests/stress-test.js
 *
 * Ramps from 0 to 500+ users to find where the system degrades.
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8000";

const errorRate = new Rate("errors");
const httpDuration = new Trend("http_duration", true);

export const options = {
  stages: [
    { duration: "1m", target: 50 },
    { duration: "2m", target: 100 },
    { duration: "2m", target: 200 },
    { duration: "2m", target: 300 },
    { duration: "2m", target: 500 },
    { duration: "3m", target: 500 },  // Sustain at breaking point
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    errors: ["rate<0.3"], // Allow higher error rate for stress test
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
  // Hit health check with no auth
  const res = http.get(`${BASE_URL}/health`);
  check(res, {
    "health 200": (r) => r.status === 200,
    "health < 5s": (r) => r.timings.duration < 5000,
  });
  errorRate.add(res.status !== 200);
  httpDuration.add(res.timings.duration);

  // Attempt login
  const email = `stress_${randomString(6)}@test.com`;
  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email, password: "TestPassword123!" }),
    { headers: { "Content-Type": "application/json" } }
  );
  httpDuration.add(loginRes.timings.duration);

  // Light think time to simulate real users
  sleep(Math.random() * 3 + 1);
}

export function handleSummary(data) {
  const metrics = data.metrics;
  let output = "\n=== STRESS TEST RESULTS ===\n";
  output += `Peak VUs: ${metrics.vus_max?.values?.value || 0}\n`;
  output += `Total requests: ${metrics.http_reqs?.values?.count || 0}\n`;
  output += `Failed rate: ${((metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2)}%\n`;
  output += `Avg response: ${metrics.http_req_duration?.values?.avg?.toFixed(0) || 0}ms\n`;
  output += `P95 response: ${metrics.http_req_duration?.values?.["p(95)"]?.toFixed(0) || 0}ms\n`;
  output += `P99 response: ${metrics.http_req_duration?.values?.["p(99)"]?.toFixed(0) || 0}ms\n`;
  output += `Max response: ${metrics.http_req_duration?.values?.max?.toFixed(0) || 0}ms\n`;
  output += `RPS: ${metrics.http_reqs?.values?.rate?.toFixed(1) || 0}\n`;

  // Determine breaking point
  const p95 = metrics.http_req_duration?.values?.["p(95)"] || 0;
  const failRate = metrics.http_req_failed?.values?.rate || 0;
  if (p95 > 5000 || failRate > 0.1) {
    output += `\n⚠️  BREAKING POINT DETECTED: p95=${p95.toFixed(0)}ms, fail_rate=${(failRate * 100).toFixed(1)}%\n`;
  }

  return {
    "load-tests/results/stress-test-summary.json": JSON.stringify(data, null, 2),
    stdout: output,
  };
}
