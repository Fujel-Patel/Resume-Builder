/**
 * Scenario: Auth Flow — Signup + Login + Token Refresh
 *
 * Run: k6 run load-tests/scenarios/auth.js
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8000";
const errorRate = new Rate("auth_errors");
const authDuration = new Trend("auth_duration", true);

export const options = {
  vus: 50,
  duration: "5m",
  thresholds: {
    auth_duration: ["p(95)<2000"],
    auth_errors: ["rate<0.05"],
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
  const email = `auth_${randomString(8)}@test.com`;
  const password = "TestPassword123!";

  // Signup
  let res = http.post(
    `${BASE_URL}/api/v1/auth/signup`,
    JSON.stringify({ name: "Auth Test", email, password }),
    { headers: { "Content-Type": "application/json" } }
  );
  authDuration.add(res.timings.duration);
  errorRate.add(res.status !== 201 && res.status !== 409);
  sleep(0.5);

  // Login
  res = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email, password }),
    { headers: { "Content-Type": "application/json" } }
  );
  authDuration.add(res.timings.duration);

  let accessToken = null;
  if (res.status === 200) {
    const body = JSON.parse(res.body);
    accessToken = body.data?.access_token;
  }
  check(res, { "login success": () => accessToken !== null });
  errorRate.add(res.status !== 200);
  sleep(1);

  // Access protected endpoint
  if (accessToken) {
    res = http.get(`${BASE_URL}/api/v1/resumes/dashboard`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    authDuration.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    sleep(2);
  }

  // Refresh token
  res = http.post(`${BASE_URL}/api/v1/auth/refresh`, null, {
    headers: { Cookie: "refresh_token=dummy" },
  });
  authDuration.add(res.timings.duration);
  sleep(1);

  // Logout
  res = http.post(`${BASE_URL}/api/v1/auth/logout`, null, {
    headers: { Cookie: "refresh_token=dummy" },
  });
  authDuration.add(res.timings.duration);
  sleep(Math.random() * 3 + 1);
}
