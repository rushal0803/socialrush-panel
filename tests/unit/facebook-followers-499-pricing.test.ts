import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SERVICE_PRICES, calculateServiceTotal } from "../../lib/service-pricing.ts";
import { getServiceById } from "../../lib/smm-service-catalog.ts";
import { getPackageById } from "../../lib/big-packages.ts";

test("Facebook Followers has the same INR 499 per 1K in catalog, calculators and package cards", () => {
  const service = getServiceById("facebook-followers");
  assert.equal(SERVICE_PRICES["facebook-followers"], 499);
  assert.equal(service?.pricePer1000, 499);
  for (const [quantity, total] of [[1000, 499], [2000, 998], [5000, 2495], [10000, 4990]]) {
    assert.equal(calculateServiceTotal("facebook-followers", quantity), total);
  }
  assert.equal(getPackageById("fb-followers-5k")?.basePriceINR, 2495);
  assert.equal(getPackageById("fb-followers-10k")?.basePriceINR, 4990);
  assert.equal(getPackageById("fb-followers-20k")?.basePriceINR, 9980);
  assert.equal(getPackageById("fb-followers-50k")?.basePriceINR, 24950);
});

test("checkout uses active database service rate, rather than old display price", () => {
  const checkout = readFileSync("app/api/checkout/intent/route.ts", "utf8");
  assert.match(checkout, /requestedQuantity \* Number\(matchedService\.rate\)/);
  const migration = readFileSync("supabase/migrations/202610160001_facebook_followers_price_499.sql", "utf8");
  assert.match(migration, /set rate = 499\.0000/);
  assert.match(migration, /lower\(trim\(name\)\) = 'facebook followers'/);
  assert.match(migration, /lower\(trim\(platform\)\) = 'facebook'/);
  assert.match(migration, /checkout_campaign_with_wallet/);
  assert.match(migration, /'fb-followers'.*499\.0000/);
  assert.doesNotMatch(migration, /update public\.orders/i);
});
