import assert from "node:assert/strict";
import test from "node:test";
import { webVitalNavigationType, webVitalPageTemplate, webVitalReleaseId } from "../../lib/analytics/web-vital-dimensions.ts";

test("public templates are stable for homepage, directory, checkout-adjacent pages and international hubs", () => {
  assert.equal(webVitalPageTemplate("/"), "home");
  assert.equal(webVitalPageTemplate("/services?platform=youtube"), "services");
  assert.equal(webVitalPageTemplate("/packages"), "packages");
  assert.equal(webVitalPageTemplate("/buy-instagram-followers-india"), "service-detail");
  assert.equal(webVitalPageTemplate("/blog/how-to-grow"), "blog-article");
  assert.equal(webVitalPageTemplate("/us"), "country-hub");
  assert.equal(webVitalPageTemplate("/ca/buy-instagram-followers"), "country-landing");
});
test("private path templates never return identifiers, tokens, query strings or personal routes", () => {
  for (const p of ["/dashboard/orders/9f6bbfbc-7813-40be-b3fe-b66b710bfd48", "/dashboard/orders/another-user-id?token=private"]) {
    const group = webVitalPageTemplate(p);
    assert.equal(group, "dashboard-order-detail");
    assert.ok(!group.includes("9f6b") && !group.includes("private") && !group.includes("another-user"));
  }
  assert.equal(webVitalPageTemplate("/dashboard/wallet"), "dashboard-wallet");
  assert.equal(webVitalPageTemplate("/admin/orders/any-id"), "admin-orders");
});
test("deployment attribution accepts only a git SHA and never sends arbitrary values", () => {
  assert.equal(webVitalReleaseId("F03CA023B88C7EBC4A67C7A78E141109516CE479"), "f03ca023b88c");
  assert.equal(webVitalReleaseId("not-a-sha"), "unknown");
  assert.equal(webVitalReleaseId(undefined), "unknown");
});
test("navigation attribution uses a bounded, non-identifying set of values", () => {
  assert.equal(webVitalNavigationType("back-forward"), "back-forward");
  assert.equal(webVitalNavigationType("reload"), "reload");
  assert.equal(webVitalNavigationType("back_forward"), "back-forward");
  assert.equal(webVitalNavigationType("user:/dashboard/orders/123"), "unknown");
  assert.equal(webVitalNavigationType(undefined), "unknown");
});
