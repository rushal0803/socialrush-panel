import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getServiceById } from "../../lib/smm-service-catalog.ts";
import { canonicalIndiaServicePaths } from "../../lib/seo/canonical-india-services.ts";

const source = (path: string) => readFileSync(path, "utf8");
const route = source("app/(india-seo-services)/buy-youtube-watch-hours-india/page.tsx");
const landing = source("components/marketing/YouTubeWatchHoursWorkspace.tsx");
const guide = source("components/seo/YouTubeWatchHoursBuyerGuide.tsx");

test("watch-hours uses one indexable canonical with accurate commercial intent", () => {
  assert.equal(canonicalIndiaServicePaths["buy-youtube-watch-hours-india"], "/buy-youtube-watch-hours-india");
  assert.match(route, /const path = "\/buy-youtube-watch-hours-india"/);
  assert.match(route, /robots: \{ index: true, follow: true \}/);
  assert.match(route, /Buy YouTube Watch Hours India/);
  assert.match(route, /realistic watch-time estimates/);
  assert.match(route, /Monetization is not guaranteed/);
  assert.match(route, /<YouTubeWatchHoursWorkspace facts=\{live\} buyerGuide=\{<YouTubeWatchHoursBuyerGuide \/>\} \/>/);
  assert.match(landing, /\{buyerGuide\}/);
});

test("watch-hour planning formula accounts for incomplete viewing, not entire video", () => {
  assert.match(landing, /const \[avgViewedPercent, setAvgViewedPercent\] = useState\(40\)/);
  assert.match(landing, /quantity \* minutes \* avgViewedPercent \/ 100 \/ 60/);
  assert.match(landing, /Assumed average percentage watched/);
  assert.match(landing, /Illustrative Watch-Time Hours/);
  assert.match(landing, /not delivered hours or YPP-qualified watch time/);
  assert.match(landing, /Adjust this hypothetical retention assumption/);
  assert.doesNotMatch(landing, /RECOMMENDED 60\+ MIN/);
  assert.doesNotMatch(landing, /Existing guidance notes 24–72 hours/);
  assert.match(landing, /does not change order quantity, pricing or actual YouTube analytics/);
});

test("view quantity and protected live checkout remain authoritative", () => {
  const service = getServiceById("youtube-watch-hours");
  assert.equal(service?.requiresLiveCatalogFacts, true);
  assert.equal(service?.minQuantity, 0);
  assert.equal(service?.maxQuantity, 0);
  assert.match(landing, /const live = facts\?\.available \? facts : null/);
  assert.match(landing, /quantity \* live.rate \/ 1000/);
  assert.match(landing, /service=youtube-watch-hours/);
  assert.match(landing, /encodeURIComponent\(url\)/);
  assert.match(landing, /"SERVICE PREVIEW"/);
  assert.match(guide, /public catalog does not publish a reliable fixed watch-hour price or quantity limit/);
});

test("YPP eligibility cautions and official source links are server visible", () => {
  assert.match(guide, /Buy YouTube watch hours in India: estimate viewing time without promising monetization/);
  assert.match(guide, /where to buy YouTube watch hours/);
  assert.match(guide, /Shorts Feed watch time is not qualified watch time/);
  assert.match(guide, /YouTube excludes watch time from ad campaigns and Shorts/);
  assert.match(guide, /support.google.com\/youtube\/answer\/72851/);
  assert.match(guide, /support.google.com\/youtube\/answer\/3399767/);
  assert.doesNotMatch(guide, /application\/ld\+json/, "do not duplicate existing service and FAQ schema");
});

test("FAQPage questions match questions rendered to users", () => {
  for (const q of [
    "How are estimates calculated?",
    "Do Shorts and paid campaigns count toward the 4,000-hour YPP threshold?",
    "Are estimated watch hours guaranteed by the order?",
  ]) {
    assert.ok(route.includes(q), "missing schema question: " + q);
    assert.ok(landing.includes(q), "missing visible question: " + q);
  }
  assert.match(route, /"@type": "FAQPage"/);
  assert.match(route, /<BreadcrumbJsonLd items=/);
  assert.match(route, /<ServiceSearchDecisionGuide service="youtube-watch-hours" \/>/);
});

test("watch-hours guide keeps canonical cross-links to related video pages", () => {
  assert.match(guide, /href="\/youtube-views"/);
  assert.match(guide, /href="\/buy-youtube-comments-india"/);
  assert.match(landing, /\["YouTube Comments India","\/buy-youtube-comments-india"\]/);
});
