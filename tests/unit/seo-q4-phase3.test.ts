import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const blogData = readFileSync(new URL("../../components/marketing/blog/blogData.ts", import.meta.url), "utf8");
const youtubeGrowth = readFileSync(new URL("../../app/youtube-growth-india/page.tsx", import.meta.url), "utf8");
const blogHub = readFileSync(new URL("../../app/blog/page.tsx", import.meta.url), "utf8");

function articleSlice(slug: string) {
  const start = blogData.indexOf(`slug: "${slug}"`);
  assert.notEqual(start, -1, `${slug} exists`);
  const next = blogData.indexOf("slug: \"", start + 10);
  return blogData.slice(start, next === -1 ? undefined : next);
}

test("YouTube subscribers-vs-views article matches the observed question intent", () => {
  const article = articleSlice("youtube-subscribers-vs-views-india");
  assert.match(article, /title: "YouTube Subscribers vs Views: Which Matters More for Growth\?"/);
  assert.match(article, /metaTitle: "YouTube Subscribers vs Views: Which Matters More\? \| SocialRUSH"/);
  assert.match(article, /Subscribers or views—which matters more on YouTube\?/);
  assert.match(article, /updatedAt: "2026-10-07"/);
  assert.match(article, /click-through rate, retention, watch time/);
});

test("YouTube growth hub is clearly a service-comparison hub and links to the comparison guide", () => {
  assert.match(youtubeGrowth, /title: "YouTube Growth Services India \| Subscribers, Views & Watch Hours"/);
  assert.match(youtubeGrowth, /Compare YouTube growth services in India for subscribers, views, likes, comments and watch hours/);
  assert.match(youtubeGrowth, /YouTube Growth Services India: compare subscribers, views and watch hours\./);
  assert.match(youtubeGrowth, /href="\/blog\/youtube-subscribers-vs-views-india"/);
});

test("Growth Library snippet names the platforms and guide intent directly", () => {
  assert.match(blogHub, /title: "Social Media Growth Guides India \| Instagram, YouTube & SEO"/);
  assert.match(blogHub, /Read practical India-focused guides for Instagram, YouTube, Facebook, LinkedIn and SEO, covering growth strategy, pricing, safety and campaign planning\./);
});
