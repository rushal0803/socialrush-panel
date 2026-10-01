import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const audit = readFileSync(new URL("../../scripts/seo-instagram-sitemap-check.mjs", import.meta.url), "utf8");
const sitemap = readFileSync(new URL("../../app/sitemap.xml/route.ts", import.meta.url), "utf8");
const workflow = readFileSync(new URL("../../.github/workflows/seo-health-monitor.yml", import.meta.url), "utf8");

test("phase 17 sitemap audit covers the canonical Instagram commercial cluster", () => {
  for (const path of [
    "/instagram-growth-india",
    "/buy-instagram-followers-india",
    "/instagram-likes",
    "/instagram-views",
    "/buy-instagram-comments-india",
    "/buy-instagram-saves-india",
    "/buy-instagram-shares-india",
  ]) {
    assert.ok(audit.includes(`"${path}"`), path + " must be protected by the Phase 17 audit");
  }
});

test("phase 17 sitemap audit covers Instagram tools, editorial guides and country pages", () => {
  for (const path of [
    "/tools/instagram-engagement-rate-calculator",
    "/tools/instagram-follower-growth-rate-calculator",
    "/tools/instagram-reach-rate-calculator",
    "/tools/instagram-story-engagement-rate-calculator",
    "/tools/instagram-caption-counter",
    "/blog/instagram-followers-upi-payment-guide-india",
    "/blog/best-time-to-post-on-instagram-india",
    "/blog/why-instagram-followers-drop",
    "/blog/how-to-grow-instagram-followers-organically-india",
    "/blog/how-to-grow-fast-on-instagram",
    "/blog/how-to-grow-instagram-followers-in-india",
    "/blog/instagram-followers-price-in-india",
    "/blog/is-it-safe-to-buy-instagram-followers",
    "/blog/how-to-increase-instagram-followers-safely-in-india",
    "/blog/instagram-followers-vs-engagement",
    "/blog/instagram-followers-vs-likes-india",
    "/blog/instagram-views-vs-reach",
    "/us/buy-instagram-followers",
    "/uk/buy-instagram-followers",
    "/ca/buy-instagram-followers",
    "/au/buy-instagram-followers",
    "/ae/buy-instagram-followers",
    "/sg/buy-instagram-followers",
  ]) {
    assert.ok(audit.includes(`"${path}"`), path + " must be protected by the Phase 17 audit");
  }
});

test("phase 17 rejects redirects, duplicate/query URLs, private routes and noncanonical pages", () => {
  for (const path of [
    "/buy-instagram-followers",
    "/instagram-followers",
    "/buy-instagram-likes-india",
    "/buy-instagram-views-india",
    "/instagram-smm-panel-india",
    "/smm-panel-for-instagram-india",
    "/services/instagram",
  ]) {
    assert.ok(audit.includes(`"${path}"`), path + " must be excluded from sitemap submission");
  }

  assert.match(audit, /response\.status !== 200/);
  assert.match(audit, /hasNoindex/);
  assert.match(audit, /canonicalHref/);
  assert.match(audit, /SSR HTML is too thin/);
  assert.match(audit, /queryOrFragment/);
  assert.match(audit, /duplicates/);
  assert.match(audit, /privateUrls/);
  assert.match(audit, /wrongHost/);
});

test("phase 17 keeps sitemap generation on canonical source inventories and schedules the production guard", () => {
  assert.match(sitemap, /canonicalIndiaServicePaths/);
  assert.match(sitemap, /\.\.\.countryServicePaths/);
  assert.match(sitemap, /\.\.\.blogRoutes/);
  assert.match(sitemap, /isCommercialAliasPath/);
  assert.match(workflow, /node scripts\/seo-instagram-sitemap-check\.mjs/);
});
