import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SERVICE_PRICES, calculateServiceTotal } from "../../lib/service-pricing.ts";
import { getServiceById } from "../../lib/smm-service-catalog.ts";

test("Instagram Real Followers has one 999.90 per 1K fallback rate and no refill", () => {
  const service = getServiceById("instagram-followers");
  assert.equal(SERVICE_PRICES["instagram-followers"], 999.90);
  assert.equal(calculateServiceTotal("instagram-followers", 1000), 999.90);
  assert.equal(calculateServiceTotal("instagram-followers", 2000), 1999.80);
  assert.equal(service?.name, "Instagram Real Followers");
  assert.equal(service?.pricePer1000, 999.90);
  assert.equal(service?.refillPolicy, "No refill");
  assert.equal(service?.refillSupported, false);
  assert.equal(service?.refillDays, null);
});

test("Instagram Followers landing page discloses no refill and real followers service", () => {
  const page = readFileSync("app/buy-instagram-followers-india/page.tsx", "utf8");
  assert.match(page, /Instagram Real Followers/);
  assert.match(page, /999\.90/);
  assert.match(page, /no refill support/i);
});
