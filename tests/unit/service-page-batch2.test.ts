import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { canonicalServiceRoutes } from "../../lib/seo/canonical-service-routes.ts";
import { servicePriceSpecification } from "../../lib/seo/service-price-specification.ts";
import { engagementBuyerChecks, engagementBuyerFaqSchema } from "../../lib/seo/engagement-buyer-checks.ts";

test("batch-two existing offers identify their delivery unit without altering rates", () => {
  for (const [path, unit] of [
    ["/youtube-likes", "likes"], ["/facebook-views", "views"], ["/linkedin-likes", "likes"],
    ["/buy-instagram-saves-india", "saves"], ["/buy-instagram-shares-india", "shares"],
    ["/buy-youtube-comments-india", "comments"], ["/buy-facebook-shares-india", "shares"],
    ["/buy-facebook-group-members-india", "members"],
  ]) {
    const spec = servicePriceSpecification(path, 123.45).priceSpecification;
    assert.equal(spec?.price, 123.45);
    assert.equal(spec?.referenceQuantity.value, 1000);
    assert.equal(spec?.referenceQuantity.unitText, unit);
  }
  // No invented watch-hour rate or availability when the sold unit is unresolved.
  assert.deepEqual(servicePriceSpecification("/buy-youtube-watch-hours-india", 4999), {});
});

test("dedicated batch-two canonical owners remain outside generated catch-all pages", () => {
  for (const path of ["/buy-instagram-comments-india", "/buy-instagram-saves-india", "/buy-instagram-shares-india", "/buy-youtube-comments-india", "/buy-facebook-shares-india", "/buy-facebook-group-members-india"]) {
    const ownerExists = existsSync(new URL(`../../app${path}/page.tsx`, import.meta.url)) || existsSync(new URL(`../../app/(india-seo-services)${path}/page.tsx`, import.meta.url));
    assert.equal(ownerExists, true, path);
    assert.equal(Object.hasOwn(canonicalServiceRoutes, path.slice(1)), false, path);
  }
});

test("buyer answers and FAQ schemas share exact wording without static price claims", () => {
  for (const service of ["facebook-views", "linkedin-likes"] as const) {
    const data = engagementBuyerChecks[service];
    const schema = engagementBuyerFaqSchema(service);
    assert.equal(schema.mainEntity.length, service === "linkedin-likes" ? 5 : 3);
    schema.mainEntity.forEach((question, index) => {
      assert.equal(question.name, data.questions[index][0]);
      assert.equal(question.acceptedAnswer.text, data.questions[index][1]);
    });
    assert.match(JSON.stringify(schema), /do not guarantee|does not prove|do not establish/);
    assert.doesNotMatch(JSON.stringify(schema), /₹|InStock|guaranteed delivery/);
  }
});
