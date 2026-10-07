import assert from "node:assert/strict";
import { test } from "node:test";
import { buildPackageTiers } from "../../lib/package-engine.ts";
import { smmServiceCatalog } from "../../lib/smm-service-catalog.ts";
import { PACKAGE_DISCOUNTS } from "../../lib/package-discounts.ts";
import { adaptPackageTier, getWalletPackageState } from "../../lib/package-ui-adapter.ts";

test("all supported services can use live facts, with bounded unique quantities and configured discounts", () => {
  for (const definition of smmServiceCatalog) {
    const service = { ...definition, requiresLiveCatalogFacts: false, pricePer1000: 127.39, minQuantity: 17, maxQuantity: 287, quantityStep: 3 };
    const tiers = buildPackageTiers(service, true);
    assert.ok(tiers.length >= 3, definition.code);
    assert.equal(new Set(tiers.map(tier => tier.quantity)).size, tiers.length);
    tiers.forEach((tier, index) => {
      assert.ok(tier.quantity >= 17 && tier.quantity <= 287);
      assert.equal((tier.quantity - 17) % 3, 0);
      const regular = Math.round(tier.quantity * 127.39 * 100 / 1000);
      assert.equal(tier.pricePaise, Math.max(1, Math.round(regular * (100 - PACKAGE_DISCOUNTS[index].discountPercent) / 100)));
    });
  }
});

test("single-quantity services have one tier; missing rates never produce free packages", () => {
  const service = { ...smmServiceCatalog[0], minQuantity: 50, maxQuantity: 50 };
  assert.equal(buildPackageTiers(service, true).length, 1);
  assert.equal(buildPackageTiers({ ...service, pricePer1000: 0 }, true).length, 0);
});

test("wallet sufficient, insufficient and loading states use paise boundaries", () => {
  const service = { ...smmServiceCatalog[0], pricePer1000: 100, minQuantity: 100, maxQuantity: 1000 };
  const tier = buildPackageTiers(service, true)[1];
  const selection = adaptPackageTier({ platform: service.platform, platformLabel: "Instagram", service, tiers: [tier], pricingStatus: "catalog" }, tier);
  const price = tier.pricePaise! / 100;
  assert.equal(getWalletPackageState(selection, price).hasEnoughBalance, true);
  assert.equal(getWalletPackageState(selection, price - 1).amountNeeded, 1);
  assert.equal(getWalletPackageState(selection, null).hasEnoughBalance, false);
});
