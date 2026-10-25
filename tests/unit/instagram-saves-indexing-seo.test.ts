import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getServiceById } from "../../lib/smm-service-catalog.ts";
import { canonicalIndiaServicePaths } from "../../lib/seo/canonical-india-services.ts";

const read = (path: string) => readFileSync(path, "utf8");
const route = read("app/buy-instagram-saves-india/page.tsx");
const landing = read("components/marketing/services/InstagramSavesLanding.tsx");
const buyerGuide = read("components/seo/InstagramSavesBuyerGuide.tsx");

test("Instagram Saves preserves its only canonical buying URL and indexable metadata", () => {
  assert.equal(canonicalIndiaServicePaths["buy-instagram-saves-india"], "/buy-instagram-saves-india");
  assert.match(route, /const path = "\/buy-instagram-saves-india"/);
  assert.match(route, /robots: \{ index: true, follow: true \}/);
  assert.match(route, /Buy Instagram saves for public posts or Reels in India/);
  assert.match(route, /delivery and refill terms before checkout/);
  assert.match(route, /buyerGuide=\{<InstagramSavesBuyerGuide \/>\}/);
  assert.match(landing, /\{buyerGuide\}/);
  assert.match(buyerGuide, /Before you buy Instagram saves in India|Buy Instagram saves in India: what to check/);
  assert.match(buyerGuide, /where to buy Instagram saves/);
});

test("Instagram Saves buyer guide distinguishes catalog references from live checkout", () => {
  const catalog = getServiceById("instagram-saves");
  assert.equal(catalog?.minQuantity, 100);
  assert.equal(catalog?.maxQuantity, 1000);
  assert.equal(catalog?.requiresLiveCatalogFacts, true);
  assert.match(buyerGuide, /getServiceById\("instagram-saves"\)/);
  assert.match(buyerGuide, /final quantity, price and availability/);
  assert.match(buyerGuide, /do not guarantee Indian users/);
  assert.match(buyerGuide, /may violate Instagram rules/);
  assert.match(buyerGuide, /live order builder/);
  assert.match(landing, /Are saves guaranteed to come from India/);
  assert.match(landing, /Are saves permanent or covered by refill/);
  assert.match(landing, /Do purchased Instagram saves have platform risks/);
});

test("Existing live order guards and contextual incoming links remain", () => {
  assert.match(landing, /live\?\.available \? live : null/);
  assert.match(landing, /validateCampaignLink\(url, linkRules\["instagram-saves"\]\)/);
  assert.match(landing, /service=instagram-saves|service: "instagram-saves"/);
  assert.match(landing, /<ServiceSearchDecisionGuide service="instagram-saves" \/>/);
  for (const path of [
    "components/seo/InstagramLikesBuyingChecklist.tsx",
    "components/seo/InstagramViewsBuyingGuide.tsx",
    "components/seo/InstagramCommentsBuyingGuide.tsx",
  ]) {
    assert.match(read(path), /href="\/buy-instagram-saves-india"/, `missing contextual inbound link from ${path}`);
  }
});
