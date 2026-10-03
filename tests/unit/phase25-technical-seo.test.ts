import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 25 keeps active canonical India service pages discoverable", () => {
  const sitemap = read("app/sitemap.xml/route.ts");
  assert.doesNotMatch(sitemap, /excludedServiceSlugs/);
  assert.match(sitemap, /indiaServiceSlugs\.map\(sitemapServicePath\)/);
  assert.doesNotMatch(sitemap, /"\/services\/tiktok-story-views"/);
});

test("Phase 25 full-sitemap audit rejects redirect and noindex leakage", () => {
  const audit = read("scripts/seo-sitewide-technical-audit.mjs");
  assert.match(audit, /sitemap URL must return 200 directly/);
  assert.match(audit, /sitemap URL is marked noindex/);
  assert.match(audit, /canonical mismatch/);
  assert.match(audit, /canonical is not on the HTTPS www host/);
});

test("Phase 25 audit validates metadata, language and JSON-LD", () => {
  const audit = read("scripts/seo-sitewide-technical-audit.mjs");
  assert.match(audit, /title is missing/);
  assert.match(audit, /meta description is missing/);
  assert.match(audit, /html lang attribute is missing/);
  assert.match(audit, /application\\\/ld\\\+json/);
  assert.match(audit, /JSON\.parse/);
});

test("Phase 25 weekly SEO monitor runs the sitewide technical audit", () => {
  const workflow = read(".github/workflows/seo-health-monitor.yml");
  const pkg = read("package.json");
  assert.match(workflow, /seo-sitewide-technical-audit\.mjs/);
  assert.match(pkg, /"seo:technical": "node scripts\/seo-sitewide-technical-audit\.mjs"/);
});
