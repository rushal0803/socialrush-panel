import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { merchandiseQuantityValues } from "../../lib/cro/quantity-merchandising.ts";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");
const builders = [
  "components/marketing/InstagramFollowersOrderPanel.tsx",
  "components/marketing/InstagramLikesOrderPanel.tsx",
  "components/marketing/InstagramViewsOrderPanel.tsx",
  "components/marketing/InstagramCommentsLanding.tsx",
  "components/marketing/services/InstagramSavesLanding.tsx",
  "components/marketing/services/InstagramSharesLanding.tsx",
];

test("Phase 20 uses the same measurable CRO primitives across all six Instagram order journeys", () => {
  for (const path of builders) {
    const source = read(path);
    assert.match(source, /QuantityDecisionGrid/, path + " should expose clear quantity choices");
    assert.match(source, /OrderReadinessChecklist/, path + " should expose order readiness");
    assert.match(source, /OrderBuilderView/, path + " should track builder views");
    assert.match(source, /trackOrderContinue/, path + " should track valid order handoff");
  }
});

test("neutral quantity merchandising never claims popularity or savings", () => {
  const options = merchandiseQuantityValues([100, 500, 1000, 5000]);
  assert.deepEqual(options.map((item) => item.value), [100, 500, 1000, 5000]);
  assert.equal(options[0].label, "Starter");
  assert.equal(options.at(-1)?.label, "Scale");
  assert.ok(options.every((item) => [null, "Starter", "Balanced", "Scale"].includes(item.label)));
});

test("Phase 20 CRO kit contains no fake scarcity, popularity, or discount language", () => {
  const source = read("components/marketing/cro/InstagramOrderConversionKit.tsx");
  assert.doesNotMatch(source, /most popular|best seller|limited time|only \d+ left|save \d+%|discount/i);
  assert.match(source, /Final price and current service terms remain visible before checkout/);
  assert.match(source, /package_viewed/);
  assert.match(source, /package_selected/);
  assert.match(source, /new_order_clicked/);
});
