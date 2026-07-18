/**
 * Soak Test — 2-hour endurance test
 *
 * Run: k6 run load-tests/soak-test.js
 *
 * Detects memory leaks and connection pool degradation over time.
 * Sustained 50 users for 2 hours.
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8000";

const errorRate = new Rate("errors");
const httpDuration = new Trend("http_duration", true);

export const options = {
  stages: [
    { duration: "5m", target: 50 },    // Ramp up
    { duration: "1h50m", target: 50 }, // Sustain for ~2 hours
    { duration: "5m", target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<3000"],
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

export default function () {
  // Rotate between different endpoints to simulate real usage
  const endpoints = [
    { method: "GET", path: "/health" },
    { method: "GET", path: "/api/v1/resumes/dashboard" },
    { method: "GET", path: "/api/v1/resumes/" },
    { method: "GET", path: "/api/v1/ats/history" },
    { method: "GET", path: "/api/v1/settings/ai/providers" },
  ];

  const ep = endpoints[Math.floor(Math.random() * endpoints.length)];
  const res = http.get(`${BASE_URL}${ep.path}`, {
    headers: { "Content-Type": "application/json" },
  });

  check(res, {
    "status 200": (r) => r.status === 200,
    "response < 5s": (r) => r.timings.duration < 5000,
  });
  errorRate.add(res.status !== 200);
  httpDuration.add(res.timings.duration);

  sleep(Math.random() * 5 + 1);
}

export function handleSummary(data) {
  const metrics = data.metrics;
  let output = "\n=== SOAK TEST RESULTS (2 hours) ===\n";
  output += `Total requests: ${metrics.http_reqs?.values?.count || 0}\n`;
  output += `Failed rate: ${((metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2)}%\n`;
  output += `Avg: ${metrics.http_req_duration?.values?.avg?.toFixed(0) || 0}ms\n`;
  output += `P95: ${metrics.http_req_duration?.values?.["p(95)"]?.toFixed(0) || 0}ms\n`;
  output += `P99: ${metrics.http_req_duration?.values?.["p(99)"]?.toFixed(0) || 0}ms\n`;
  output += `RPS: ${metrics.http_reqs?.values?.rate?.toFixed(1) || 0}\n`;

  // Memory leak detection heuristic: if p95 grows over time, it's a leak
  output += `\nIf P95 grew significantly over 2 hours, investigate memory leaks.\n`;

  return {
    "load-tests/results/soak-test-summary.json": JSON.stringify(data, null, 2),
    stdout: output,
  };
}
