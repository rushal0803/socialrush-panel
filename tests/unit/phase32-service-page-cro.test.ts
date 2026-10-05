import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getServicePageCroConfig } from "../../lib/cro/service-page-cro.ts";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 32 routes safe static services into the inline builder", () => {
  const config = getServicePageCroConfig({
    platform: "facebook",
    code: "facebook-shares",
    pricePer1000: 499,
    minQuantity: 100,
    maxQuantity: 100000,
  });
  assert.equal(config.mode, "inline-builder");
  assert.equal(config.primaryHref, "#order-builder");
  assert.equal(config.primaryLabel, "Build Your Order");
  assert.equal(config.canShowStaticPrice, true);
});

test("Phase 32 keeps protected live-fact services out of static pricing", () => {
  const config = getServicePageCroConfig({
    platform: "x",
    code: "twitter-likes",
    pricePer1000: 499,
    minQuantity: 100,
    maxQuantity: 100000,
    requiresLiveCatalogFacts: true,
  });
  assert.equal(config.mode, "live-dashboard");
  assert.match(config.primaryHref, /^\/dashboard\/new-order\?/);
  assert.match(config.primaryHref, /platform=x/);
  assert.match(config.primaryHref, /service=twitter-likes/);
  assert.equal(config.canShowStaticPrice, false);
});

test("Phase 32 treats invalid or zero static catalog ranges as live-order only", () => {
  for (const service of [
    { pricePer1000: 0, minQuantity: 100, maxQuantity: 1000 },
    { pricePer1000: 499, minQuantity: 0, maxQuantity: 0 },
    { pricePer1000: 499, minQuantity: 1000, maxQuantity: 100 },
  ]) {
    const config = getServicePageCroConfig({ platform: "x", code: "service", ...service });
    assert.equal(config.mode, "live-dashboard");
    assert.equal(config.canShowStaticPrice, false);
  }
});

test("Phase 32 generic service pages use exact-service CRO instead of broad package-only handoff", () => {
  const page = read("app/services/[slug]/page.tsx");
  assert.match(page, /getServicePageCroConfig/);
  assert.match(page, /data-service-primary-cta/);
  assert.match(page, /data-service-cro-mode="inline-builder"/);
  assert.match(page, /data-service-cro-mode="live-dashboard"/);
  assert.match(page, /<ServiceLandingOrderBuilder service=\{catalogService\} compact/);
  assert.match(page, /<ServiceOrderStickyCta/);
  assert.match(page, /Live pricing in secure order/);
  assert.match(page, /protected live catalog facts/);
});

test("Phase 32 shared order card keeps neutral merchandising and service-specific instructions", () => {
  const card = read("components/marketing/services/ServiceOrderCard.tsx");
  assert.match(card, /buildQuantityMerchandising/);
  assert.match(card, /option\.label/);
  assert.match(card, /data-cro-service-instruction/);
  assert.doesNotMatch(card, /most popular|best seller|limited time|only \d+ left|save \d+%|discount/i);
});
