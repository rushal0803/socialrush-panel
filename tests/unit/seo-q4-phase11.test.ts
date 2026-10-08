import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../../app/(india-seo-services)/buy-instagram-views-india/page.tsx", import.meta.url), "utf8");

test("Instagram Views keeps canonical commercial intent and Reel/video wording", () => {
  assert.match(page, /const path="\/instagram-views"/);
  assert.match(page, /Buy Instagram Views India \| Live INR Plans \| SocialRUSH/);
  assert.match(page, /public Instagram Reels and video posts/);
});

test("Instagram Views includes commercial schema and India search-demand coverage", () => {
  assert.match(page, /<IndiaCommercialServiceJsonLd code="instagram-views"/);
  assert.match(page, /path="\/instagram-views"/);
  assert.match(page, /serviceType="Instagram Reel and video views service"/);
  assert.match(page, /<IndiaSearchDemandSection serviceCode="instagram-views"/);
  assert.match(page, /liveRatePer1000=\{service\?\.pricePer1000 \?\? null\}/);
});

test("Instagram Views preserves the existing live order path", () => {
  assert.match(page, /InstagramViewsOrderPanel/);
  assert.match(page, /href="#packages"/);
  assert.match(page, /ServiceOrderStickyCta href="#packages"/);
  assert.doesNotMatch(page, /\/buy-instagram-views-india/);
});
