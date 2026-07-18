/**
 * Spike Test — Sudden traffic bursts
 *
 * Run: k6 run load-tests/spike-test.js
 *
 * Simulates viral traffic or marketing push.
 * Normal → Spike → Recovery → Spike → Recovery.
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8000";

const errorRate = new Rate("errors");
const httpDuration = new Trend("http_duration", true);

export const options = {
  stages: [
    { duration: "1m", target: 10 },   // Baseline
    { duration: "10s", target: 200 },  // SPIKE
    { duration: "2m", target: 200 },  // Sustain spike
    { duration: "10s", target: 10 },   // Recovery
    { duration: "2m", target: 10 },   // Baseline again
    { duration: "10s", target: 300 },  // BIGGER SPIKE
    { duration: "3m", target: 300 },  // Sustain
    { duration: "1m", target: 10 },   // Recovery
    { duration: "2m", target: 0 },    // Wind down
  ],
  thresholds: {
    errors: ["rate<0.2"],
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
  const res = http.get(`${BASE_URL}/health`);
  check(res, {
    "health 200": (r) => r.status === 200,
    "health < 10s": (r) => r.timings.duration < 10000,
  });
  errorRate.add(res.status !== 200);
  httpDuration.add(res.timings.duration);

  sleep(Math.random() * 2 + 0.5);
}

export function handleSummary(data) {
  const metrics = data.metrics;
  let output = "\n=== SPIKE TEST RESULTS ===\n";
  output += `Peak VUs: ${metrics.vus_max?.values?.value || 0}\n`;
  output += `Total requests: ${metrics.http_reqs?.values?.count || 0}\n`;
  output += `Failed rate: ${((metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2)}%\n`;
  output += `P95: ${metrics.http_req_duration?.values?.["p(95)"]?.toFixed(0) || 0}ms\n`;
  output += `Max: ${metrics.http_req_duration?.values?.max?.toFixed(0) || 0}ms\n`;
  output += `RPS: ${metrics.http_reqs?.values?.rate?.toFixed(1) || 0}\n`;

  return {
    "load-tests/results/spike-test-summary.json": JSON.stringify(data, null, 2),
    stdout: output,
  };
}
