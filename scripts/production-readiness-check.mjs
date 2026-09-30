#!/usr/bin/env node

const DEFAULT_BASE_URL = "https://www.getsocialrush.com";
const REQUEST_TIMEOUT_MS = 20_000;
const baseUrl = new URL(process.env.PRODUCTION_BASE_URL || DEFAULT_BASE_URL);
const failures = [];
let checks = 0;

function pass(label) {
  checks += 1;
  console.log(`PASS  ${label}`);
}

function fail(label, detail) {
  checks += 1;
  failures.push(`${label}: ${detail}`);
  console.error(`FAIL  ${label} — ${detail}`);
}

async function fetchWithTimeout(path, redirect = "follow") {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(new URL(path, baseUrl), {
      redirect,
      signal: controller.signal,
      headers: {
        "user-agent": "SocialRUSH-Production-Readiness/1.0",
        accept: "text/html,application/json;q=0.9,*/*;q=0.8",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function checkPublicRoute(path) {
  const label = `public ${path}`;
  try {
    const response = await fetchWithTimeout(path);
    if (response.status !== 200) return fail(label, `expected 200, received ${response.status}`);
    const html = await response.text();
    if (!/<title>[^<]+<\/title>/i.test(html)) return fail(label, "missing title");
    if (/application error|internal server error|server error/i.test(html)) return fail(label, "error content detected");
    pass(label);
  } catch (error) {
    fail(label, error instanceof Error ? error.message : String(error));
  }
}

async function checkHealth() {
  try {
    const response = await fetchWithTimeout("/api/health");
    const payload = await response.json().catch(() => null);
    if (response.status !== 200) return fail("api health", `expected 200, received ${response.status}`);
    if (!payload || payload.status !== "ok" || payload?.services?.app !== "ok" || payload?.services?.database !== "ok") {
      return fail("api health", "app/database health is not fully ok");
    }
    pass("api health");
  } catch (error) {
    fail("api health", error instanceof Error ? error.message : String(error));
  }
}

async function checkProtectedRoute(path) {
  const label = `protected ${path}`;
  try {
    const response = await fetchWithTimeout(path, "manual");
    const location = response.headers.get("location") || "";
    const redirectedToLogin = [301,302,303,307,308].includes(response.status) && /\/login(?:\?|$)/.test(new URL(location, baseUrl).pathname + new URL(location, baseUrl).search);
    if (!redirectedToLogin) return fail(label, `expected login redirect, received ${response.status} ${location || "(no location)"}`);
    pass(label);
  } catch (error) {
    fail(label, error instanceof Error ? error.message : String(error));
  }
}

console.log(`SocialRUSH production readiness check: ${baseUrl.origin}`);
await checkHealth();

for (const path of ["/", "/services", "/packages", "/pricing", "/trust", "/login"]) {
  await checkPublicRoute(path);
}

for (const path of ["/dashboard", "/dashboard/new-order", "/dashboard/orders"]) {
  await checkProtectedRoute(path);
}

console.log(`\n${checks - failures.length}/${checks} checks passed.`);
if (failures.length) {
  console.error("\nProduction readiness failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
}
