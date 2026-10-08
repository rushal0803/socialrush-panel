import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const views = readFileSync(new URL("../../components/marketing/FacebookViewsLanding.tsx", import.meta.url), "utf8");
const likes = readFileSync(new URL("../../components/marketing/FacebookLikesLanding.tsx", import.meta.url), "utf8");
const blog = readFileSync(new URL("../../components/marketing/blog/blogData.ts", import.meta.url), "utf8");

function articleSlice(slug: string) {
  const start = blog.indexOf(`slug: "${slug}"`);
  assert.notEqual(start, -1, `${slug} exists`);
  const next = blog.indexOf("slug: \"", start + 10);
  return blog.slice(start, next === -1 ? undefined : next);
}

test("Facebook Views gains search-demand coverage without changing order flow", () => {
  assert.match(views, /<SearchDemandPriceSection displayName="Facebook Views"/);
  assert.match(views, /serviceCode="facebook-views"/);
  assert.match(views, /packagesHref="\/packages\?platform=facebook&service=views"/);
  assert.match(views, /<OrderBuilder \/>/);
});

test("Facebook Likes links directly to the canonical Facebook Views page", () => {
  assert.match(likes, /\["Facebook Views","\/facebook-views","Public video visibility service"\]/);
  assert.doesNotMatch(likes, /\["Facebook Views","\/services\?platform=facebook"/);
});

test("Facebook decision guide owns direct question intent and links the cluster", () => {
  const article = articleSlice("facebook-followers-vs-engagement-india");
  assert.match(article, /title: "Facebook Followers vs Engagement: Which Matters More\?"/);
  assert.match(article, /metaTitle: "Facebook Followers vs Engagement: Which Matters More\? \| SocialRUSH"/);
  assert.match(article, /Which matters more on Facebook: followers or engagement\?/);
  assert.match(article, /updatedAt: "2026-10-09"/);
  assert.match(article, /label: "Facebook views in India", href: "\/facebook-views"/);
  assert.match(article, /label: "Facebook likes for public posts", href: "\/facebook-likes"/);
  assert.match(article, /label: "Facebook followers in India", href: "\/buy-facebook-followers-india"/);
});
