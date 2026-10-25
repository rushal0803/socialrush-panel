import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getServiceById } from "../../lib/smm-service-catalog.ts";
import { calculateServiceTotal } from "../../lib/service-pricing.ts";
import { getIndiaServiceMetadata, getIndiaServicePage } from "../../lib/seo/india-service-pages.ts";
import { canonicalIndiaServicePaths } from "../../lib/seo/canonical-india-services.ts";

const page = readFileSync("app/(india-seo-services)/buy-instagram-likes-india/page.tsx", "utf8");
const guide = readFileSync("components/seo/InstagramLikesBuyingChecklist.tsx", "utf8");

test("Instagram Likes buyer-intent page preserves canonical and two keyword intents", () => {
  assert.equal(canonicalIndiaServicePaths["buy-instagram-likes-india"], "/instagram-likes");
  const metadata = getIndiaServiceMetadata("buy-instagram-likes-india", "/instagram-likes");
  assert.match(JSON.stringify(metadata.title), /Buy Instagram Likes in India/);
  assert.equal(metadata.alternates?.canonical, "https://www.getsocialrush.com/instagram-likes");
  assert.match(metadata.description ?? "", /Buy Instagram likes in India/);
  assert.match(page, /<InstagramLikesBuyingChecklist \/>/);
  assert.match(guide, /where to buy Instagram likes/);
  assert.match(guide, /buying Instagram likes in India/);
  assert.match(page, /"@type": "FAQPage"/);
});

test("Instagram Likes SEO guidance matches the catalog and states important limitations", () => {
  const service = getServiceById("instagram-likes");
  assert.equal(service?.pricePer1000, 249);
  assert.equal(service?.minQuantity, 100);
  assert.equal(service?.deliveryTime, "1-3 days");
  assert.equal(service?.refillPolicy, "Refill eligible");
  assert.equal(getIndiaServicePage("buy-instagram-likes-india").delivery, "1–3 days");
  assert.equal(calculateServiceTotal("instagram-likes", 1000), 249);
  assert.match(page, /Are Instagram likes guaranteed to come from India/);
  assert.match(page, /Can I order likes using only my Instagram profile link/);
  assert.match(page, /Instagram likes for posts and Reels in India/);
  assert.doesNotMatch(page, /Indian Instagram likes for public posts and Reels/);
  assert.match(guide, /not guaranteed to come from Indian accounts/);
  assert.match(guide, /Artificial engagement can be removed/);
  assert.match(guide, /final price, availability, delivery window/);
  assert.match(guide, /instagram.com\/reel\//);
});
