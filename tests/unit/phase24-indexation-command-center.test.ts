import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 24 exposes a dedicated admin SEO indexation route", () => {
  const sidebar = read("components/admin/AdminSidebar.tsx");
  const page = read("app/admin/seo/indexation/page.tsx");
  assert.match(sidebar, /SEO Indexation/);
  assert.match(sidebar, /\/admin\/seo\/indexation/);
  assert.match(page, /Google Indexation Command Center/);
});

test("Phase 24 never fabricates Google indexed status", () => {
  const model = read("lib/seo/indexation-command-center.ts");
  const page = read("app/admin/seo/indexation/page.tsx");
  assert.match(model, /status: "unavailable"/);
  assert.match(model, /Use Search Console URL Inspection/);
  assert.match(page, /Google status is intentionally not guessed/);
});

test("Phase 24 checks the technical signals required for index eligibility", () => {
  const model = read("lib/seo/indexation-command-center.ts");
  assert.match(model, /httpStatus === 200/);
  assert.match(model, /sitemapIncluded/);
  assert.match(model, /robotsBlocked/);
  assert.match(model, /noindex/);
  assert.match(model, /canonicalMatches/);
});

test("Phase 24 remains inside the admin noindex boundary", () => {
  const layout = read("app/admin/layout.tsx");
  assert.match(layout, /robots: \{ index: false, follow: false, nocache: true \}/);
});
