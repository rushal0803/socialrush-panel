import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { articleSlugs } from "../../components/marketing/blog/blogData.ts";
import {
  buildPricingAuthorityEntries,
  pricingAuthorityDefinitions,
} from "../../lib/seo/pricing-authority.ts";

test("pricing authority definitions keep one canonical service target per platform card", () => {
  const servicePaths = pricingAuthorityDefinitions.map((item) => item.servicePath);
  assert.equal(new Set(servicePaths).size, servicePaths.length);
  assert.equal(pricingAuthorityDefinitions.length, 7);
  for (const item of pricingAuthorityDefinitions) {
    assert.match(item.servicePath, /^\//);
    assert.equal(item.servicePath.includes("?"), false);
  }
});

test("pricing authority guide links resolve to published search-demand guides", () => {
  const published = new Set(articleSlugs);
  const guides = pricingAuthorityDefinitions.flatMap((item) => item.guidePath ? [item.guidePath] : []);
  assert.equal(guides.length, 6);
  for (const href of guides) {
    assert.match(href, /^\/blog\//);
    assert.ok(published.has(href.replace("/blog/", "")), `${href} must be a published article`);
  }
});

test("pricing authority entries calculate 1K and 5K planning totals from the supplied rate", () => {
  const entries = buildPricingAuthorityEntries([
    { code: "instagram-followers", pricePer1000: 799 },
    { code: "youtube-subscribers", pricePer1000: 3999 },
    { code: "x-followers", pricePer1000: 1499 },
  ]);
  const instagram = entries.find((item) => item.code === "instagram-followers");
  const youtube = entries.find((item) => item.code === "youtube-subscribers");
  const tiktok = entries.find((item) => item.code === "tiktok-followers");
  assert.deepEqual(instagram?.planning, [
    { quantity: 1000, total: 799 },
    { quantity: 5000, total: 3995 },
  ]);
  assert.deepEqual(youtube?.planning, [
    { quantity: 1000, total: 3999 },
    { quantity: 5000, total: 19995 },
  ]);
  assert.equal(tiktok?.pricePer1000, null);
  assert.deepEqual(tiktok?.planning, []);
});

test("pricing page exposes the authority hub and structured item list", () => {
  const source = readFileSync(new URL("../../app/pricing/page.tsx", import.meta.url), "utf8");
  assert.match(source, /<PricingAuthorityHub serviceCatalog=\{serviceCatalog\}/);
  assert.match(source, /"@type": "ItemList"/);
  assert.match(source, /monthly social media management pricing/i);
});
