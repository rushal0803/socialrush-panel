import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// No network calls, credentials or production traffic: inspect source contracts only.
const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const robots = read("app/robots.txt/route.ts");
const sitemap = read("app/sitemap.xml/route.ts");
const metadata = read("lib/seo/metadata.ts");
const nextConfig = read("next.config.mjs");

test("public SEO routes share one production hostname", () => {
  assert.match(metadata, /SEO_SITE_URL\s*=\s*"https:\/\/www\.getsocialrush\.com"/);
  assert.match(robots, /Sitemap: \$\{SEO_SITE_URL\}\/sitemap\.xml/);
  assert.match(sitemap, /new URL\(path, `\$\{SEO_SITE_URL\}\/`\)/);
});

test("robots policy restricts private and transactional paths for every crawler", () => {
  for (const group of ["User-agent: OAI-SearchBot", "User-agent: *"]) {
    assert.ok(robots.includes(group), `missing ${group}`);
  }
  for (const path of ["/dashboard", "/admin", "/api/", "/auth/", "/orders", "/wallet", "/order-summary", "/packages/checkout"]) {
    assert.ok(robots.split(`Disallow: ${path}`).length >= 3, `both groups must block ${path}`);
  }
});

test("sitemap is limited to public route collections and deduplicates aliases", () => {
  assert.match(sitemap, /new Set\(\[/);
  assert.match(sitemap, /isCommercialAliasPath\(route\)/);
  assert.match(sitemap, /escapeXml\(absoluteUrl\(route\)\)/);
  assert.match(sitemap, /application\/xml/);
  // No private route literal may be added to the public sitemap inventory.
  const inventory = sitemap.match(/const publicRoutes = \[([\s\S]*?)\] as const;/)?.[1] ?? "";
  for (const path of ["/dashboard", "/admin", "/api", "/wallet", "/orders", "/login", "/register", "/order-summary", "/packages/checkout"]) {
    assert.ok(!new RegExp(`["']${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`).test(inventory), `private route in sitemap: ${path}`);
  }
});

test("legacy commercial URLs redirect and apex host resolves to www", () => {
  assert.match(nextConfig, /source: "\/buy-linkedin-followers-india"[\s\S]*?destination: "\/linkedin-followers"/);
  assert.match(nextConfig, /value: "getsocialrush\.com"/);
  assert.match(nextConfig, /destination: "https:\/\/www\.getsocialrush\.com\/:path\*"/);
});
