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

test("Phase 20 retains measurable CRO behavior across inline and shared Instagram order journeys", () => {
  for (const path of builders) {
    const source = read(path);
    const delegates = /<ServiceOrderCard\s/.test(source);
    if (delegates) assert.match(source, /import ServiceOrderCard from "@\/components\/marketing\/services\/ServiceOrderCard"/);
    const implementation = delegates ? read("components/marketing/services/ServiceOrderCard.tsx") : source;
    assert.match(implementation, /QuantityDecisionGrid|data-cro-quantity-grid/, path + " should expose clear quantity choices");
    assert.match(implementation, /OrderReadinessChecklist|data-cro-readiness/, path + " should expose order readiness");
    assert.match(implementation, /OrderBuilderView|track\("package_viewed"/, path + " should track builder views");
    assert.match(implementation, /trackOrderContinue|track\("new_order_clicked"/, path + " should track valid order handoff");
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
