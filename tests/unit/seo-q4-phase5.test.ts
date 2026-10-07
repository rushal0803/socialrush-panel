import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const services = readFileSync(new URL("../../app/services/page.tsx", import.meta.url), "utf8");
const servicesContent = readFileSync(new URL("../../components/marketing/services/ServicesPageContent.tsx", import.meta.url), "utf8");
const blog = readFileSync(new URL("../../components/marketing/blog/blogData.ts", import.meta.url), "utf8");

function articleSlice(slug: string) {
  const start = blog.indexOf(`slug: "${slug}"`);
  assert.notEqual(start, -1, `${slug} exists`);
  const next = blog.indexOf("slug: \"", start + 10);
  return blog.slice(start, next === -1 ? undefined : next);
}

test("services page keeps SMM intent while clarifying comparison intent", () => {
  assert.match(services, /title: "SMM Panel India \| Compare Social Media Services & INR Plans"/);
  assert.match(services, /question: "What is an SMM panel\?"/);
  assert.match(servicesContent, /SMM Panel India: compare social media growth services/);
});

test("Instagram follower-drop guide matches exact question intent and is refreshed", () => {
  const article = articleSlice("why-instagram-followers-drop");
  assert.match(article, /title: "Why Are My Instagram Followers Dropping\? Causes & Fixes"/);
  assert.match(article, /metaTitle: "Why Are My Instagram Followers Dropping\? Causes & Fixes"/);
  assert.match(article, /Instagram followers dropping suddenly\?/);
  assert.match(article, /updatedAt: "2026-10-07"/);
});

test("follower-drop guide contextually links to the canonical Instagram followers page", () => {
  const article = articleSlice("why-instagram-followers-drop");
  assert.match(article, /label: "Instagram follower options in India", href: "\/buy-instagram-followers-india"/);
  assert.doesNotMatch(article, /href: "\/instagram-followers"/);
  assert.doesNotMatch(article, /href: "\/buy-instagram-followers"/);
});
