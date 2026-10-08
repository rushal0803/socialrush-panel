import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runProductionQualityMonitor } from "../../lib/monitoring/quality.ts";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

function responseFor(path: string) {
  if (path === "/api/health") {
    return new Response(JSON.stringify({ status: "ok", services: { app: "ok", database: "ok" } }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  const bodies: Record<string, string> = {
    "/": "<html><title>SocialRUSH</title><body>SocialRUSH</body></html>",
    "/services": "<html><body>SocialRUSH Services</body></html>",
    "/packages": "<html><body>SocialRUSH Packages</body></html>",
    "/login": "<html><body>Welcome back to SocialRUSH</body></html>",
    "/register": "<html><body>Create your SocialRUSH account</body></html>",
    "/status": "<html><body>Service availability</body></html>",
    "/buy-instagram-followers-india": "<html><body>Instagram followers</body></html>",
    "/youtube-subscribers": "<html><body>YouTube subscribers</body></html>",
    "/linkedin-followers": "<html><body>LinkedIn followers</body></html>",
    "/robots.txt": "User-agent: *\nDisallow: /admin\nSitemap: https://www.getsocialrush.com/sitemap.xml\n",
    "/sitemap.xml": "<urlset><loc>https://www.getsocialrush.com/buy-instagram-followers-india</loc><loc>https://www.getsocialrush.com/youtube-subscribers</loc><loc>https://www.getsocialrush.com/linkedin-followers</loc></urlset>",
  };

  return new Response(bodies[path] ?? "ok", {
    status: 200,
    headers: path === "/" ? {
      "content-security-policy": "default-src 'self'; script-src 'self' https://sdk.cashfree.com",
      "strict-transport-security": "max-age=31536000; includeSubDomains",
      "x-content-type-options": "nosniff",
      "content-type": "text/html",
    } : undefined,
  });
}

test("Phase 47 reports healthy when critical read-only production signals pass", async () => {
  const snapshot = await runProductionQualityMonitor({
    origin: "https://example.test",
    fetcher: async (input, init) => {
      assert.equal(init?.method, "GET");
      return responseFor(new URL(String(input)).pathname);
    },
  });

  assert.equal(snapshot.overall, "healthy");
  assert.equal(snapshot.summary.critical, 0);
  assert.equal(snapshot.summary.total, 13);
  assert.match(snapshot.note, /read-only GET checks only/i);
  assert.match(snapshot.note, /never submits an order/i);
});

test("Phase 47 makes degraded application/database health a critical failure", async () => {
  const snapshot = await runProductionQualityMonitor({
    origin: "https://example.test",
    fetcher: async (input) => {
      const path = new URL(String(input)).pathname;
      if (path === "/api/health") {
        return new Response(JSON.stringify({ status: "degraded", services: { app: "ok", database: "unavailable" } }), {
          status: 503,
          headers: { "content-type": "application/json" },
        });
      }
      return responseFor(path);
    },
  });

  assert.equal(snapshot.overall, "critical");
  assert.ok(snapshot.checks.some((check) => check.id === "api-health" && check.state === "critical"));
});

test("Phase 47 keeps the production monitor non-mutating", () => {
  const source = read("lib/monitoring/quality.ts");
  const runner = read("scripts/quality-production-check.ts");
  assert.match(source, /method: "GET"/);
  assert.doesNotMatch(source + runner, /method:\s*"POST"|method:\s*'POST'/);
  assert.doesNotMatch(source + runner, /create-order|place-order|wallet.*update|rpc\(/i);
});

test("Phase 47 schedules six-hour production monitoring and retains evidence", () => {
  const workflow = read(".github/workflows/quality-monitor.yml");
  const pkg = read("package.json");
  assert.match(workflow, /cron: "23 \*\/6 \* \* \*"/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /production-quality-report/);
  assert.match(workflow, /artifacts\/quality-monitor\/report\.json/);
  assert.match(pkg, /"quality:production": "node --experimental-strip-types scripts\/quality-production-check\.ts"/);
});

test("Phase 47 exposes the quality command center in admin", () => {
  const sidebar = read("components/admin/AdminSidebar.tsx");
  const page = read("app/admin/quality/page.tsx");
  assert.match(sidebar, /Quality Monitor/);
  assert.match(sidebar, /\/admin\/quality/);
  assert.match(page, /Phase 47 · Automated Quality Monitoring/);
  assert.match(page, /Production Quality Monitor/);
  assert.match(page, /View incidents/);
});
