import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const packages = readFileSync(new URL("../../app/packages/page.tsx", import.meta.url), "utf8");
const packageContent = readFileSync(new URL("../../components/marketing/packages/PremiumPackagesPageContent.tsx", import.meta.url), "utf8");
const pricing = readFileSync(new URL("../../app/pricing/page.tsx", import.meta.url), "utf8");
const blog = readFileSync(new URL("../../components/marketing/blog/blogData.ts", import.meta.url), "utf8");

function articleSlice(slug: string) {
  const start = blog.indexOf(`slug: "${slug}"`);
  assert.notEqual(start, -1, `${slug} exists`);
  const next = blog.indexOf("slug: \"", start + 10);
  return blog.slice(start, next === -1 ? undefined : next);
}

test("packages owns preset campaign and quantity comparison intent", () => {
  assert.match(packages, /title: "Social Media Packages India \| Compare Prices & Quantities"/);
  assert.match(packages, /by platform, service, quantity and price/);
  assert.match(packageContent, /compare quantities and save on larger orders/);
  assert.match(packageContent, /"\/pricing"/);
  assert.match(packageContent, /Need a custom quantity/);
});

test("pricing keeps live rate intent separate from preset packages", () => {
  assert.match(pricing, /title: "Social Media Service Price List India \| Live INR Rates"/);
  assert.match(pricing, /Compare live social media service <span className="text-orange-300">prices in India\.<\/span>/);
  assert.match(pricing, /href="\/packages"/);
});

test("Instagram price guide is refreshed, price-neutral and points to live pricing", () => {
  const article = articleSlice("instagram-followers-price-in-india");
  assert.match(article, /title: "Instagram Followers Price in India: What Affects Cost\?"/);
  assert.match(article, /metaTitle: "Instagram Followers Price in India: What Affects Cost\?"/);
  assert.match(article, /updatedAt: "2026-10-07"/);
  assert.match(article, /label: "live social media service price list in India", href: "\/pricing"/);
  assert.doesNotMatch(article, /₹[\d,]+/);
});
