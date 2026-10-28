import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { canonicalIndiaServicePaths } from "../../lib/seo/canonical-india-services.ts";
import { getServiceById } from "../../lib/smm-service-catalog.ts";
import { youtubeWatchHoursFaqs } from "../../lib/seo/youtube-watch-hours-faq.ts";

const read = (path: string) => readFileSync(path, "utf8");
const route = read("app/(india-seo-services)/buy-youtube-watch-hours-india/page.tsx");
const workspace = read("components/marketing/YouTubeWatchHoursWorkspace.tsx");
const guide = read("components/seo/YouTubeWatchHoursBuyerGuide.tsx");

test("YouTube Watch Hours preserves canonical, indexable commercial route", () => {
  assert.equal(canonicalIndiaServicePaths["buy-youtube-watch-hours-india"], "/buy-youtube-watch-hours-india");
  assert.match(route, /const path = "\/buy-youtube-watch-hours-india"/);
  assert.match(route, /robots: \{ index: true, follow: true \}/);
  assert.match(route, /title: "Buy YouTube Watch Hours India \| INR Pricing \| SocialRUSH"/);
  assert.match(route, /Monetization is not guaranteed/);
  assert.match(route, /<YouTubeWatchHoursWorkspace facts=\{live\} buyerGuide=\{<YouTubeWatchHoursBuyerGuide \/>\} \/>/);
  assert.match(route, /<ServiceSearchDecisionGuide service="youtube-watch-hours"/);
  assert.match(workspace, /\{buyerGuide\}/);
});

test("Server-rendered guide distinguishes buying intent, video links and qualified YPP hours", () => {
  assert.match(guide, /Buy YouTube watch hours in India: check real eligibility before paying/);
  assert.match(guide, /qualified public watch hours/);
  assert.match(guide, /youtube.com\/watch\?v=/);
  assert.match(guide, /youtu.be\//);
  assert.match(guide, /Shorts Feed does not count/);
  assert.match(guide, /full-length viewing illustration/);
  assert.match(guide, /including zero/);
  assert.match(guide, /4,000 qualified public watch hours/);
  assert.match(guide, /support.google.com\/adsense\/answer\/72851/);
  assert.match(guide, /support.google.com\/youtube\/answer\/3399767/);
  assert.doesNotMatch(guide, /application\/ld\+json/, "do not duplicate site schema");
});

test("Watch-hours order keeps the live catalog authoritative rather than inventing package pricing", () => {
  const service = getServiceById("youtube-watch-hours");
  assert.equal(service?.requiresLiveCatalogFacts, true);
  assert.equal(service?.minQuantity, 0);
  assert.equal(service?.maxQuantity, 0);
  assert.match(route, /getLiveServiceFacts\("youtube", "YouTube Watch Hours"\)/);
  assert.match(workspace, /const live = facts\?\.available \? facts : null/);
  assert.match(guide, /public catalog contains placeholder limits/);
  assert.match(guide, /Use the active service to confirm availability/);
  assert.match(workspace, /SERVICE PREVIEW/);
});

test("Calculator is labelled full-duration illustration and not guaranteed qualified watch hours", () => {
  assert.match(workspace, /quantity \* minutes \/ 60/);
  assert.match(workspace, /assumes every view watches the entire video/);
  assert.match(workspace, /100% completion for every view/);
  assert.match(workspace, /not a watch-time forecast/);
  assert.match(workspace, /Actual and eligible YouTube watch hours may be lower or zero/);
  const question = youtubeWatchHoursFaqs.find(([q]) => q.startsWith("Does a 60-minute video"));
  assert.ok(question);
  assert.match(question[1], /not an expected or verified result/);
});

test("Visible FAQs and JSON-LD use one set of accurate YPP and buyer answers", () => {
  assert.equal(youtubeWatchHoursFaqs.length, 9);
  assert.match(route, /youtubeWatchHoursFaqs\.map\(\(\[name, text\]\)/);
  assert.match(workspace, /youtubeWatchHoursFaqs\.map\(\(\[q,a\]\)/);
  assert.match(route, /"@type": "FAQPage"/);
  assert.ok(youtubeWatchHoursFaqs.some(([q]) => q.includes("buying watch hours in India")));
  assert.ok(youtubeWatchHoursFaqs.some(([q]) => q.includes("4,000 watch-hours")));
});

test("YouTube engagement service guides cross-link to the canonical Watch Hours page", () => {
  for (const path of [
    "components/marketing/YouTubeViewsLanding.tsx",
    "components/marketing/YouTubeLikesLanding.tsx",
    "components/marketing/YouTubeSubscribersLanding.tsx",
    "components/seo/YouTubeCommentsBuyerGuide.tsx",
  ]) {
    assert.match(read(path), /href="\/buy-youtube-watch-hours-india"/, `missing canonical inbound link from ${path}`);
  }
});


test("Watch-hours public URL eligibility is restricted to long-form video IDs", () => {
  assert.match(workspace, /u\.pathname === "\/watch"/);
  assert.match(workspace, /u\.searchParams\.get\("v"\)/);
  assert.match(workspace, /u\.hostname === "youtu\.be"/);
  assert.doesNotMatch(workspace, /\^\\\/shorts/);
  assert.match(workspace, /const orderHref = validUrl \?/);
});
