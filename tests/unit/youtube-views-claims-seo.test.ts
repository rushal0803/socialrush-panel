import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const copy = readFileSync("lib/seo/india-service-pages.ts", "utf8");
const landing = readFileSync("components/marketing/YouTubeViewsLanding.tsx", "utf8");
const route = readFileSync("app/(india-seo-services)/buy-youtube-views-india/page.tsx", "utf8");

test("YouTube Views route retains canonical metadata provider and landing", () => {
  assert.match(route, /getIndiaServiceMetadata\("buy-youtube-views-india"\)/);
  assert.match(route, /<YouTubeViewsLanding/);
});

test("YouTube Views buyer copy avoids promises of reach and watch time", () => {
  const start = copy.indexOf('"buy-youtube-views-india": {');
  const end = copy.indexOf('"buy-youtube-comments-india": {', start);
  const service = copy.slice(start, end);
  assert.ok(service.length > 300);
  assert.match(service, /do not guarantee unique reach, audience retention or recommendations/);
  assert.match(service, /not proof of authentic interest, meaningful watch time/);
});

test("Simulated YouTube Views dashboard explicitly identifies illustrative metrics", () => {
  assert.match(landing, /Illustrative UI preview · not live order data/);
  assert.match(landing, /Views do not guarantee ranking, reach/);
});
