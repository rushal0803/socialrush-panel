import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const blog = readFileSync(new URL("../../components/marketing/blog/blogData.ts", import.meta.url), "utf8");
const views = readFileSync(new URL("../../app/(india-seo-services)/buy-instagram-views-india/page.tsx", import.meta.url), "utf8");

function articleSlice(slug: string) {
  const start = blog.indexOf(`slug: "${slug}"`);
  assert.notEqual(start, -1, `${slug} exists`);
  const next = blog.indexOf("slug: \"", start + 10);
  return blog.slice(start, next === -1 ? undefined : next);
}

test("followers vs likes guide owns direct question intent and freshness", () => {
  const article = articleSlice("instagram-followers-vs-likes-india");
  assert.match(article, /title: "Instagram Followers vs Likes: Which Matters More for Growth\?"/);
  assert.match(article, /metaTitle: "Instagram Followers vs Likes: Which Matters More\? \| SocialRUSH"/);
  assert.match(article, /Followers or likes—which matters more on Instagram\?/);
  assert.match(article, /updatedAt: "2026-10-09"/);
  assert.match(article, /href: "\/instagram-views"/);
});

test("followers vs engagement guide owns direct question intent and cluster links", () => {
  const article = articleSlice("instagram-followers-vs-engagement");
  assert.match(article, /title: "Instagram Followers vs Engagement: Which Matters More\?"/);
  assert.match(article, /metaTitle: "Instagram Followers vs Engagement: Which Matters More\? \| SocialRUSH"/);
  assert.match(article, /Which matters more on Instagram: followers or engagement\?/);
  assert.match(article, /updatedAt: "2026-10-09"/);
  assert.match(article, /href: "\/blog\/instagram-followers-vs-likes-india"/);
  assert.match(article, /href: "\/instagram-likes"/);
  assert.match(article, /href: "\/instagram-views"/);
});

test("Instagram Views links back to the decision guides without changing the order path", () => {
  assert.match(views, /href="\/blog\/instagram-followers-vs-likes-india"/);
  assert.match(views, /href="\/blog\/instagram-followers-vs-engagement"/);
  assert.match(views, /href="#packages"/);
  assert.match(views, /InstagramViewsOrderPanel/);
});
