import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCanonicalIndiaServicePath } from "../../lib/seo/canonical-india-services.ts";

const aliasRoute = readFileSync("app/(india-seo-services)/buy-twitter-followers-india/page.tsx", "utf8");
const seoCopy = readFileSync("lib/seo/india-service-pages.ts", "utf8");

test("Twitter Followers India URL redirects to its established canonical path", () => {
  assert.equal(getCanonicalIndiaServicePath("buy-twitter-followers-india"), "/twitter-followers");
  assert.match(aliasRoute, /permanentRedirect\("\/twitter-followers"\)/);
});

test("Twitter Followers shared copy avoids guaranteed engagement and sales claims", () => {
  const start=seoCopy.indexOf('"buy-twitter-followers-india": {');
  const end=seoCopy.indexOf('"buy-facebook-followers-india": {',start);
  const section=seoCopy.slice(start,end);
  assert.ok(section.length>250);
  assert.match(section, /Displayed follower counts alone do not demonstrate genuine X\/Twitter engagement/);
  assert.match(section, /qualified reach, trust, leads or sales/);
});
