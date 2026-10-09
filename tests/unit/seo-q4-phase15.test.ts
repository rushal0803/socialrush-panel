import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const growthHub = readFileSync(new URL("../../components/marketing/PlatformGrowthHub.tsx", import.meta.url), "utf8");
const followers = readFileSync(new URL("../../components/marketing/TwitterFollowersLanding.tsx", import.meta.url), "utf8");
const catalog = readFileSync(new URL("../../components/marketing/services/PlatformServicesLanding.tsx", import.meta.url), "utf8");
const intentGuide = readFileSync(new URL("../../components/seo/TwitterIntentGuide.tsx", import.meta.url), "utf8");
const xGrowth = readFileSync(new URL("../../app/x-growth-india/page.tsx", import.meta.url), "utf8");

test("X growth hub owns followers, likes, reposts and views decision intent", () => {
  assert.match(xGrowth, /title: "Twitter \/ X Growth Services India \| Followers, Likes, Reposts & Views"/);
  assert.match(xGrowth, /Compare Twitter \/ X growth services in India for followers, likes, reposts and views/);
  assert.match(growthHub, /platform === "twitter" && <TwitterIntentGuide \/>/);
});

test("Twitter Followers page exposes the shared X service decision guide", () => {
  assert.match(followers, /import TwitterIntentGuide from "@\/components\/seo\/TwitterIntentGuide"/);
  assert.match(followers, /<TwitterIntentGuide \/>/);
  assert.match(followers, /href="#order"/);
});

test("X service catalog exposes the same decision layer", () => {
  assert.match(catalog, /platform === "x" && <TwitterIntentGuide \/>/);
  assert.match(catalog, /canonicalServicePaths/);
  assert.match(catalog, /"x-followers": "\/twitter-followers"/);
});

test("shared X decision guide separates account growth from post engagement", () => {
  assert.match(intentGuide, /href: "\/twitter-followers"/);
  assert.match(intentGuide, /href: "\/services\/twitter-likes"/);
  assert.match(intentGuide, /href: "\/services\/twitter-retweets"/);
  assert.match(intentGuide, /href: "\/services\/twitter-views"/);
  assert.match(intentGuide, /Profile audience growth/);
  assert.match(intentGuide, /Post engagement/);
  assert.match(intentGuide, /Post amplification/);
  assert.match(intentGuide, /Post visibility/);
});
