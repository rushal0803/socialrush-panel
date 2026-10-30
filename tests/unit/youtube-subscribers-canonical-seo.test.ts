import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCanonicalIndiaServicePath } from "../../lib/seo/canonical-india-services.ts";

test("YouTube Subscribers India alias redirects to the canonical service page", () => {
  assert.equal(getCanonicalIndiaServicePath("buy-youtube-subscribers-india"), "/youtube-subscribers");
  const route = readFileSync("app/(india-seo-services)/buy-youtube-subscribers-india/page.tsx","utf8");
  assert.match(route, /permanentRedirect\("\/youtube-subscribers"\)/);
});

test("Canonical YouTube Subscribers landing shows honest buyer FAQ", () => {
  const landing = readFileSync("components/marketing/YouTubeSubscribersLanding.tsx","utf8");
  assert.match(landing, /faqs\.map/);
  assert.match(landing, /Does a larger subscriber count prove genuine audience interest/);
  assert.match(landing, /Subscriber counts alone do not establish authentic watch time/);
  assert.match(landing, /do not guarantee monetization approval/);
});
