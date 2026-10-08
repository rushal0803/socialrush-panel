import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const followers = readFileSync(new URL("../../components/marketing/LinkedInFollowersLanding.tsx", import.meta.url), "utf8");
const hub = readFileSync(new URL("../../app/linkedin-growth-india/page.tsx", import.meta.url), "utf8");
const blog = readFileSync(new URL("../../components/marketing/blog/blogData.ts", import.meta.url), "utf8");

function articleSlice(slug: string) {
  const start = blog.indexOf(`slug: "${slug}"`);
  assert.notEqual(start, -1, `${slug} exists`);
  const next = blog.indexOf("slug: \"", start + 10);
  return blog.slice(start, next === -1 ? undefined : next);
}

test("LinkedIn Followers page links to decision guides", () => {
  assert.match(followers, /href="\/blog\/linkedin-followers-vs-connections"/);
  assert.match(followers, /href="\/blog\/linkedin-followers-vs-engagement-india"/);
  assert.match(followers, /href="\/linkedin-growth-india"/);
});

test("LinkedIn growth hub connects audience and engagement decision intent", () => {
  assert.match(hub, /href="\/linkedin-followers"/);
  assert.match(hub, /href="\/linkedin-likes"/);
  assert.match(hub, /href="\/blog\/linkedin-followers-vs-connections"/);
  assert.match(hub, /href="\/blog\/linkedin-followers-vs-engagement-india"/);
});

test("LinkedIn followers-vs-engagement guide owns direct question intent and freshness", () => {
  const article = articleSlice("linkedin-followers-vs-engagement-india");
  assert.match(article, /title: "LinkedIn Followers vs Engagement: Which Matters More\?"/);
  assert.match(article, /metaTitle: "LinkedIn Followers vs Engagement: Which Matters More\? \| SocialRUSH"/);
  assert.match(article, /Which matters more on LinkedIn: followers or engagement\?/);
  assert.match(article, /updatedAt: "2026-10-09"/);
  assert.match(article, /href: "\/blog\/linkedin-followers-vs-connections"/);
  assert.match(article, /href: "\/linkedin-followers"/);
  assert.match(article, /href: "\/linkedin-likes"/);
});
