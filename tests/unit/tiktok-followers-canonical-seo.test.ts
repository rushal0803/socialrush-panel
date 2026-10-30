import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCanonicalIndiaServicePath } from "../../lib/seo/canonical-india-services.ts";
import { tiktokFollowersFaqs } from "../../lib/seo/tiktok-followers.ts";

test("TikTok Followers India route redirects to its established canonical", () => {
  assert.equal(getCanonicalIndiaServicePath("buy-tiktok-followers-india"), "/tiktok-followers");
  const route=readFileSync("app/(india-seo-services)/buy-tiktok-followers-india/page.tsx","utf8");
  assert.match(route,/permanentRedirect\("\/tiktok-followers"\)/);
});

test("Rendered TikTok FAQs clarify geographic and outcome limitations", () => {
  const landing=readFileSync("components/marketing/TikTokFollowersLanding.tsx","utf8");
  assert.match(landing,/tiktokFollowersFaqs\.map/);
  assert.ok(tiktokFollowersFaqs.some(x=>x.answer.includes("does not guarantee followers from Indian accounts")));
  assert.ok(tiktokFollowersFaqs.some(x=>x.answer.includes("do not guarantee authentic engagement")));
});
