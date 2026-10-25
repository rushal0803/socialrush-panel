import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { canonicalIndiaServicePaths } from "../../lib/seo/canonical-india-services.ts";
import { getServiceById } from "../../lib/smm-service-catalog.ts";

const read = (path: string) => readFileSync(path, "utf8");
const route = read("app/buy-instagram-shares-india/page.tsx");
const shared = read("components/marketing/services/IndiaServiceLandingPage.tsx");
const landing = read("components/marketing/services/InstagramSharesLanding.tsx");
const guide = read("components/seo/InstagramSharesBuyerGuide.tsx");

test("Instagram Shares preserves its indexable single commercial canonical", () => {
  assert.equal(canonicalIndiaServicePaths["buy-instagram-shares-india"], "/buy-instagram-shares-india");
  assert.match(route, /const path = "\/buy-instagram-shares-india"/);
  assert.match(route, /robots: \{ index: true, follow: true \}/);
  assert.match(route, /Buy Instagram Shares in India/);
  assert.match(route, /delivery and no-refill terms/);
  assert.match(route, /<IndiaServiceLandingPage slug="buy-instagram-shares-india"/);
  assert.match(shared, /<InstagramSharesLanding live=\{live\} buyerGuide=\{<InstagramSharesBuyerGuide \/>\} \/>/);
  assert.match(landing, /\{buyerGuide\}/);
  assert.match(guide, /Buy Instagram shares in India: check links, price and delivery first/);
  assert.match(guide, /where to buy Instagram shares/);
});

test("Instagram Shares buyer guide aligns with current catalog and live checkout", () => {
  const catalog = getServiceById("instagram-shares");
  assert.equal(catalog?.minQuantity, 100);
  assert.equal(catalog?.maxQuantity, 100000);
  assert.equal(catalog?.deliveryTime, "1–24 hours");
  assert.equal(catalog?.refillPolicy, "No refill");
  assert.equal(catalog?.requiresLiveCatalogFacts, true);
  assert.match(guide, /getServiceById\("instagram-shares"\)/);
  assert.match(guide, /protected checkout determine your actual quantities/);
  assert.match(guide, /indicative 1–24 hour delivery window and no refill/);
  assert.match(guide, /does not guarantee/);
  assert.match(guide, /Artificial engagement can be removed and may violate Instagram rules/);
  assert.match(landing, /live && live.available \? live : null/);
  assert.match(landing, /validateCampaignLink\(destination, linkRules\["instagram-shares"\]\)/);
  assert.match(landing, /trackOrderContinue\("instagram-shares"/);
});

test("Buyer FAQ and visible structured FAQ cover the same substantive risks", () => {
  assert.match(landing, /Do shares come from Indian accounts/);
  assert.match(landing, /Can I get a refill if the share count drops/);
  assert.match(landing, /Does buying Instagram shares guarantee followers or sales/);
  assert.match(landing, /Are purchased Instagram shares risk-free/);
  assert.match(shared, /Do shares come from Indian accounts/);
  assert.match(shared, /Is an Instagram Shares order eligible for refill/);
  assert.match(shared, /Does buying Instagram shares guarantee new followers or sales/);
  assert.match(shared, /Can buying shares have platform risks/);
  assert.match(shared, /\{ "@context": "https:\/\/schema.org", "@type": "FAQPage"/);
});

test("Existing Instagram guides link directly to the canonical Shares page", () => {
  for (const path of [
    "components/seo/InstagramLikesBuyingChecklist.tsx",
    "components/seo/InstagramViewsBuyingGuide.tsx",
    "components/seo/InstagramCommentsBuyingGuide.tsx",
    "components/seo/InstagramSavesBuyerGuide.tsx",
  ]) {
    assert.match(read(path), /href="\/buy-instagram-shares-india"/, `missing direct contextual link in ${path}`);
  }
});
