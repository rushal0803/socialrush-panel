import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getIndiaServiceMetadata, indiaServicePages } from "../../lib/seo/india-service-pages.ts";
import { canonicalIndiaServicePaths } from "../../lib/seo/canonical-india-services.ts";

const source = readFileSync("lib/seo/india-service-pages.ts", "utf8");
const route = readFileSync("app/(india-seo-services)/buy-facebook-shares-india/page.tsx", "utf8");

test("Facebook Shares retains canonical routing and commercial SEO metadata", () => {
  assert.equal(canonicalIndiaServicePaths["buy-facebook-shares-india"], "/buy-facebook-shares-india");
  const metadata = getIndiaServiceMetadata("buy-facebook-shares-india");
  assert.equal(metadata.alternates?.canonical, "https://www.getsocialrush.com/buy-facebook-shares-india");
  assert.match(String(metadata.description), /public post links/);
  assert.match(route, /getIndiaServiceMetadata\("buy-facebook-shares-india"\)/);
  assert.match(route, /<IndiaServiceLandingPage slug="buy-facebook-shares-india"/);
});
test("Facebook Shares has accurate eligibility and no reach or delivery guarantee", () => {
  const start = source.indexOf('"buy-facebook-shares-india": {');
  const end = source.indexOf('"buy-telegram-members-india": {', start);
  const text = source.slice(start, end);
  assert.match(text, /exact publicly accessible Facebook post URL/);
  assert.match(text, /not a profile or Page homepage/);
  assert.match(text, /live INR total/);
  assert.match(text, /active service terms/);
  assert.match(text, /does not promise organic distribution or Indian accounts/);
  assert.match(text, /not verified reach, referrals, authentic interest or business results/);
  assert.doesNotMatch(text, /guaranteed Indian shares|guaranteed reach/i);
});
