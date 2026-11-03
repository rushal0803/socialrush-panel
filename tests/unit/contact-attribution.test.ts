import assert from "node:assert/strict";
import test from "node:test";
import { defaultPartnerEnquiry, safeContactAttribution } from "../../lib/marketing/enquiry-attribution.ts";

test("partner enquiry from campaign retains only allowlisted campaign fields", () => {
  const query = "?service=Partnership%20Enquiry&utm_source=creator_partner&utm_medium=website&utm_campaign=distribution&email=private%40example.com&access_token=secret";
  const source = safeContactAttribution("/contact", query);
  assert.equal(source, "/contact?utm_source=creator_partner&utm_medium=website&utm_campaign=distribution");
  assert.equal(defaultPartnerEnquiry(query), "Partnership Enquiry");
  assert.equal(source.includes("email="), false);
  assert.equal(source.includes("access_token"), false);
});
test("unknown incoming service is not trusted as a selectable enquiry", () => {
  assert.equal(defaultPartnerEnquiry("?service=Unknown"), "");
  assert.equal(safeContactAttribution("/contact", "?arbitrary=1&api_key=2"), "/contact");
});
test("oversized or unsafe tracking values are bounded and sanitized", () => {
  const value = safeContactAttribution("/contact", "?utm_source=" + encodeURIComponent("A ".repeat(500)));
  assert.ok(value.length <= 200);
  assert.ok(!value.includes(" "));
  assert.ok(!value.includes("%20"));
});
