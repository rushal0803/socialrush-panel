import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../../app/(india-seo-services)/buy-instagram-views-india/page.tsx", import.meta.url), "utf8");
const canonicalRoute = readFileSync(new URL("../../app/(seo-services)/[service]/page.tsx", import.meta.url), "utf8");

test("Instagram Views keeps canonical commercial intent and Reel/video wording", () => {
  assert.match(page, /const path="\/instagram-views"/);
  assert.match(page, /Buy Instagram Views India \| Live INR Plans \| SocialRUSH/);
  assert.match(page, /Instagram Reel and video view packages/);
  assert.match(page, /<InstagramViewsBuyingGuide \/>/);
});

test("Instagram Views has one commercial schema owner and India search-demand coverage", () => {
  assert.doesNotMatch(page, /<IndiaCommercialServiceJsonLd code="instagram-views"/);
  assert.match(canonicalRoute, /<IndiaCommercialServiceJsonLd code="instagram-views"[^>]*includeOffer=\{false\}/);
  assert.match(page, /<IndiaSearchDemandSection serviceCode="instagram-views"/);
  assert.match(page, /liveRatePer1000=\{service\?\.pricePer1000 \?\? null\}/);
});

test("Instagram Views preserves the existing live order path", () => {
  assert.match(page, /InstagramViewsOrderPanel/);
  assert.match(page, /href="#packages"/);
  assert.match(page, /ServiceOrderStickyCta href="#packages"/);
  assert.doesNotMatch(page, /\/buy-instagram-views-india/);
});
