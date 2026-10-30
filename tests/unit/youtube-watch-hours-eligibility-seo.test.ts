import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { youtubeWatchHoursFaqs } from "../../lib/seo/youtube-watch-hours-faq.ts";

const route = readFileSync("app/(india-seo-services)/buy-youtube-watch-hours-india/page.tsx","utf8");
const workspace = readFileSync("components/marketing/YouTubeWatchHoursWorkspace.tsx","utf8");

test("Watch Hours SEO uses its canonical India route and qualifying metadata", () => {
  assert.match(route, /const path = "\/buy-youtube-watch-hours-india"/);
  assert.match(route, /createPageMetadata\(\{/);
  assert.match(route, /Purchased watch time may not count/);
  assert.match(route, /robots: \{ index: true, follow: true \}/);
});

test("Visible Watch Hours FAQ and JSON-LD share one source of answers", () => {
  assert.match(route, /youtubeWatchHoursFaqs\.map/);
  assert.match(workspace, /youtubeWatchHoursFaqs\.map/);
  assert.match(route, /"@type": "FAQPage"/);
  assert.match(route, /"@type": "Service"/);
  assert.ok(youtubeWatchHoursFaqs.some(([question, answer]) =>
    question.includes("monetization") && answer.includes("YouTube decides")));
  assert.ok(youtubeWatchHoursFaqs.some(([question, answer]) =>
    question.includes("4,000") && answer.includes("Artificial engagement")));
});
