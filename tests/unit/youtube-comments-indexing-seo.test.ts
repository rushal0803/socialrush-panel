import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getServiceById } from "../../lib/smm-service-catalog.ts";
import { canonicalIndiaServicePaths } from "../../lib/seo/canonical-india-services.ts";
import { getIndiaServiceMetadata } from "../../lib/seo/india-service-pages.ts";

const read = (path: string) => readFileSync(path, "utf8");
const route = read("app/(india-seo-services)/buy-youtube-comments-india/page.tsx");
const shared = read("components/marketing/services/IndiaServiceLandingPage.tsx");
const workspace = read("components/marketing/YouTubeCommentsWorkspace.tsx");
const guide = read("components/seo/YouTubeCommentsBuyerGuide.tsx");
const copy = read("lib/seo/india-service-pages.ts");

test("YouTube Comments keeps one indexable India URL and intent-aware copy", () => {
  assert.equal(canonicalIndiaServicePaths["buy-youtube-comments-india"], "/buy-youtube-comments-india");
  const meta = getIndiaServiceMetadata("buy-youtube-comments-india");
  assert.equal(meta.alternates?.canonical, "https://www.getsocialrush.com/buy-youtube-comments-india");
  assert.match(String(meta.description), /Buy YouTube comments in India/);
  assert.match(String(meta.description), /moderation and support terms/);
  assert.match(route, /getIndiaServiceMetadata\("buy-youtube-comments-india"\)/);
  assert.match(route, /<IndiaServiceLandingPage slug="buy-youtube-comments-india"/);
  assert.match(copy, /comments alone do not guarantee reach, ranking, watch hours or monetization/);
});

test("YouTube Comments has unique server-rendered eligibility and moderation help", () => {
  assert.match(shared, /<YouTubeCommentsWorkspace live=\{live\} buyerGuide=\{<YouTubeCommentsBuyerGuide \/>\} \/>/);
  assert.match(workspace, /\{buyerGuide\}/);
  assert.match(guide, /Buy YouTube comments in India: video eligibility, moderation and live packages/);
  assert.match(guide, /where to buy YouTube comments/);
  assert.match(guide, /comments are enabled/);
  assert.match(guide, /youtube.com\/shorts\//);
  assert.match(guide, /YouTube Partner Program approval/);
  assert.doesNotMatch(guide, /application\/ld\+json/, "avoid competing or duplicate FAQ schema");
});

test("Live catalog is authoritative: no invented static price, min or refill claims", () => {
  const service = getServiceById("youtube-comments");
  assert.equal(service?.requiresLiveCatalogFacts, true);
  assert.equal(service?.minQuantity, 0);
  assert.equal(service?.maxQuantity, 0);
  assert.match(guide, /does not provide a reliable fixed YouTube Comments price or quantity range/);
  assert.match(guide, /active service must supply availability/);
  assert.match(guide, /does not guarantee comments from Indian accounts/);
  assert.match(guide, /Custom comment wording/);
  assert.match(workspace, /live\?\.available && live.rate > 0/);
  assert.match(workspace, /validQuantity = Number.isInteger\(quantity\)/);
  assert.match(workspace, /validUrl = validLink\(url\)/);
  assert.match(workspace, /SERVICE PREVIEW/);
});

test("Visible FAQ and server JSON-LD agree on substantive buyer caveats", () => {
  for (const question of [
    "What if comments are disabled or held for review?",
    "Do packages guarantee Indian commenters or custom text?",
    "Can comments disappear after an order?",
  ]) {
    assert.ok(shared.includes(question), "missing server FAQ schema: " + question);
    assert.ok(workspace.includes(question), "missing rendered FAQ: " + question);
  }
  assert.match(shared, /"@type": "FAQPage"/);
});

test("YouTube watch hours links to the canonical YouTube Comments service", () => {
  const watchHours = read("components/marketing/YouTubeWatchHoursWorkspace.tsx");
  assert.match(watchHours, /\["YouTube Comments India","\/buy-youtube-comments-india"\]/);
  for (const path of [
    "components/marketing/YouTubeLikesLanding.tsx",
    "components/marketing/YouTubeViewsLanding.tsx",
    "components/marketing/YouTubeSubscribersLanding.tsx",
  ]) {
    assert.match(read(path), /href="\/buy-youtube-comments-india"/, `missing inbound link from ${path}`);
  }
});
