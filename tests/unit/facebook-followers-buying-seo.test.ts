import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getIndiaServiceMetadata } from "../../lib/seo/india-service-pages.ts";
import { canonicalIndiaServicePaths } from "../../lib/seo/canonical-india-services.ts";

const source = readFileSync("lib/seo/india-service-pages.ts", "utf8");
const route = readFileSync("app/(india-seo-services)/buy-facebook-followers-india/page.tsx", "utf8");

test("Facebook Followers retains the established canonical route and metadata", () => {
  const canonical = canonicalIndiaServicePaths["buy-facebook-followers-india"];
  const meta = getIndiaServiceMetadata("buy-facebook-followers-india");
  assert.equal(meta.alternates?.canonical, "https://www.getsocialrush.com" + canonical);
  assert.match(route, /getIndiaServiceMetadata\("buy-facebook-followers-india"\)/);
  assert.match(route, /<FacebookFollowersLanding \/>/);
});

test("Facebook Followers buyer copy distinguishes counts from trust and targeting", () => {
  const start = source.indexOf('"buy-facebook-followers-india": {');
  const end = source.indexOf('"buy-facebook-likes-india": {', start);
  const section = source.slice(start, end);
  assert.ok(section.length > 200);
  assert.match(section, /public Facebook Page or eligible profile URL/);
  assert.match(section, /current INR total/);
  assert.match(section, /not guaranteed to be India-based/);
  assert.match(section, /do not establish authentic community trust/);
  assert.match(section, /refill terms before checkout/);
});
