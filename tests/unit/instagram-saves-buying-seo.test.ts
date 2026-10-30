import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCanonicalIndiaServicePath } from "../../lib/seo/canonical-india-services.ts";
import { getIndiaServicePage } from "../../lib/seo/india-service-pages.ts";

test("Instagram Saves retains a single canonical buying URL", () => {
  const canonical = getCanonicalIndiaServicePath("buy-instagram-saves-india");
  assert.equal(canonical, "/buy-instagram-saves-india");
  const pages = readFileSync("components/marketing/services/IndiaServiceLandingPage.tsx", "utf8");
  assert.match(pages, /getIndiaServicePage\(slug\)/);
  assert.match(pages, /\{page\.intro\}/);
  assert.match(pages, /\{page\.value\}/);
});

test("Instagram Saves buyer copy avoids promises of engagement or reach", () => {
  const page = getIndiaServicePage("buy-instagram-saves-india");
  assert.match(page.intro, /Compare Instagram Saves packages/);
  assert.match(page.value, /do not prove genuine audience interest/);
  assert.match(page.destination, /public Instagram post or reel URL/);
  const metadata = readFileSync("lib/seo/india-service-pages.ts", "utf8");
  assert.match(metadata, /Buy Instagram Saves in India \| INR Pricing \| SocialRUSH/);
});
