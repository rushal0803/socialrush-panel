import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { canStartServiceOrder } from "../../lib/cro/service-live-availability.ts";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 2 blocks unverified protected live services from the public order form", () => {
  assert.equal(canStartServiceOrder(true, null), false);
  assert.equal(canStartServiceOrder(true, undefined), false);
  assert.equal(canStartServiceOrder(true, { available: false, rate: 500, min: 100, max: 1000 }), false);
  assert.equal(canStartServiceOrder(true, { available: true, rate: 0, min: 100, max: 1000 }), false);
  assert.equal(canStartServiceOrder(true, { available: true, rate: Number.NaN, min: 100, max: 1000 }), false);
  assert.equal(canStartServiceOrder(true, { available: true, rate: 500, min: 0, max: 1000 }), false);
  assert.equal(canStartServiceOrder(true, { available: true, rate: 500, min: 1000, max: 100 }), false);
  assert.equal(canStartServiceOrder(true, { available: true, rate: 500, min: 1.5, max: 1000 }), false);
  assert.equal(canStartServiceOrder(true, { available: true, rate: 500, min: 100, max: 1000 }), true);
  assert.equal(canStartServiceOrder(false, null), true);
});

test("Phase 2 keeps public catalog CTA and pricing behind the same live guard", () => {
  const source = read("components/marketing/services/PremiumCatalogServiceLanding.tsx");
  assert.match(source, /canStartServiceOrder/);
  assert.match(source, /canStartOrder \? <Link href=\{orderHref\}/);
  assert.match(source, /!canStartOrder \? <aside/);
  assert.match(source, /Currently unavailable/);
});

test("Phase 2 keeps both flagship order builders above explanatory content", () => {
  const instagram = read("app/buy-instagram-followers-india/page.tsx");
  const youtube = read("components/marketing/YouTubeSubscribersLanding.tsx");
  assert.match(instagram, /<InstagramFollowersOrderPanel compact/);
  assert.match(youtube, /<YouTubeSubscribersOrderPanel compact/);
  assert.match(instagram, /<ServiceOrderStickyCta href="#packages"/);
  assert.match(youtube, /<ServiceOrderStickyCta href="#packages"/);
});

test("Phase 2 points all YouTube subscriber intent links to the real builder anchor", () => {
  const source = read("components/marketing/YouTubeSubscribersLanding.tsx");
  assert.match(source, /orderHref="#packages"/);
  assert.doesNotMatch(source, /orderHref="#order"/);
  assert.match(read("components/marketing/YouTubeSubscribersOrderPanel.tsx"), /id="packages"/);
});

test("Phase 2 labels totals as estimated and retains required service-specific validation", () => {
  const card = read("components/marketing/services/ServiceOrderCard.tsx");
  assert.match(card, /Estimated total/);
  assert.match(card, /validateQuantity/);
  assert.match(card, /validateCampaignLink/);
  assert.match(card, /previewOrderTotal/);
  assert.match(card, /data-cro-quantity-option/);
  assert.match(card, /new_order_clicked/);
});

test("Phase 2 never hides Instagram content by positional section selector", () => {
  const globals = read("app/globals.css");
  assert.doesNotMatch(globals, /\.instagram-followers-mobile > section:nth-child\(2\)/);
});
