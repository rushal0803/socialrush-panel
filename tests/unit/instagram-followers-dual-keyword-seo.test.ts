import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { calculateServiceTotal } from "../../lib/service-pricing.ts";

const page = readFileSync("app/buy-instagram-followers-india/page.tsx", "utf8");
const guide = readFileSync("components/seo/InstagramFollowersIndiaBuyingGuide.tsx", "utf8");

test("one canonical page serves both buy Instagram followers keyword intents", () => {
  assert.match(page, /const path = "\/buy-instagram-followers-india"/);
  assert.match(page, /title: \{ absolute: "Buy Instagram Followers India \| Pricing & Terms \| SocialRUSH"/);
  assert.match(page, /description: "Buy Instagram followers in India with clear INR pricing/);
  assert.match(page, /alternates: \{ canonical: url \}/);
  assert.match(page, /robots: \{ index: true, follow: true \}/);
  assert.match(page, /<InstagramFollowersIndiaBuyingGuide \/>/);
  assert.match(guide, /Before you buy Instagram followers in India/);
});

test("SEO buyer guide stays consistent with source-of-truth prices and service limitations", () => {
  assert.equal(calculateServiceTotal("instagram-followers", 100), 99.99);
  assert.equal(calculateServiceTotal("instagram-followers", 1000), 999.90);
  assert.equal(calculateServiceTotal("instagram-followers", 5000), 4999.50);
  assert.match(guide, /calculateServiceTotal\("instagram-followers", quantity\)/);
  assert.match(guide, /no refill support/i);
  assert.match(guide, /does not promise that delivered followers are from/);
  assert.match(guide, /does not guarantee a follower/);
  assert.match(guide, /active service row controls final order pricing/i);
  assert.match(page, /name:"Instagram Real Followers"/);
  assert.match(page, /no refill support/);
  assert.match(page, /public-profile ordering/);
});
