import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const views = readFileSync(new URL("../../components/marketing/YouTubeViewsLanding.tsx", import.meta.url), "utf8");
const likes = readFileSync(new URL("../../components/marketing/YouTubeLikesLanding.tsx", import.meta.url), "utf8");
const blog = readFileSync(new URL("../../components/marketing/blog/blogData.ts", import.meta.url), "utf8");

test("YouTube Views and Likes include India search-demand coverage", () => {
  assert.match(views, /<IndiaSearchDemandSection serviceCode="youtube-views"/);
  assert.match(likes, /<IndiaSearchDemandSection serviceCode="youtube-likes"/);
  assert.match(views, /liveRatePer1000=\{service\?\.pricePer1000 \?\? null\}/);
  assert.match(likes, /liveRatePer1000=\{service\?\.pricePer1000 \?\? null\}/);
});

test("relevant guides strengthen canonical second-wave money pages", () => {
  const youtubeViewLinks = blog.match(/href: "\/youtube-views"/g) ?? [];
  assert.ok(youtubeViewLinks.length >= 2, "YouTube Views receives contextual guide links");
  assert.match(blog, /label: "YouTube views in India", href: "\/youtube-views"/);
  assert.match(blog, /label: "buy YouTube views in India", href: "\/youtube-views"/);
  assert.match(blog, /label: "Telegram member options in India", href: "\/telegram-members"/);
});

test("Phase 4 does not create duplicate commercial URLs", () => {
  assert.doesNotMatch(blog, /href: "\/buy-youtube-views-india"/);
  assert.doesNotMatch(blog, /href: "\/buy-youtube-likes-india"/);
  assert.doesNotMatch(blog, /href: "\/buy-telegram-members-india"/);
});
