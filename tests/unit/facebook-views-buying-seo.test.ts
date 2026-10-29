import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getIndiaServiceMetadata, getIndiaServiceFaqs } from "../../lib/seo/india-service-pages.ts";
import { canonicalIndiaServicePaths } from "../../lib/seo/canonical-india-services.ts";
const route = readFileSync("app/(india-seo-services)/buy-facebook-views-india/page.tsx", "utf8");
const source = readFileSync("lib/seo/india-service-pages.ts", "utf8");

test("Facebook Views keeps canonical metadata and existing landing", () => {
  const meta = getIndiaServiceMetadata("buy-facebook-views-india");
  const canonical = canonicalIndiaServicePaths["buy-facebook-views-india"];
  assert.equal(meta.alternates?.canonical, "https://www.getsocialrush.com" + canonical);
  assert.match(route, /getIndiaServiceMetadata\("buy-facebook-views-india"\)/);
  assert.match(route, /<FacebookViewsLanding \/>/);
});
test("Facebook Views buyer guidance avoids reach and geo guarantees", () => {
  const start = source.indexOf('"buy-facebook-views-india": {');
  const end = source.indexOf('"buy-facebook-shares-india": {', start);
  const section = source.slice(start, end);
  assert.match(section, /exact publicly accessible Facebook video permalink/);
  assert.match(section, /not proof of unique people reached/);
  assert.match(section, /not guaranteed to come from Indian accounts/);
  assert.match(section, /current INR total/);
});
test("Facebook Views FAQs cover links, reach, live pricing, delivery and privacy", () => {
  const faqs = getIndiaServiceFaqs("buy-facebook-views-india");
  assert.equal(faqs.length, 6);
  assert.ok(faqs.some(({ answer }) => answer.includes("video-post URL")));
  assert.ok(faqs.some(({ answer }) => answer.includes("unique reach")));
  assert.ok(faqs.some(({ answer }) => answer.includes("INR total")));
  assert.ok(faqs.some(({ answer }) => answer.includes("not guaranteed")));
  assert.ok(faqs.some(({ answer }) => answer.includes("Never share passwords")));
});
