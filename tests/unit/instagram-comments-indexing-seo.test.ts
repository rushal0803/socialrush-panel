import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getServiceById } from "../../lib/smm-service-catalog.ts";
import { getIndiaServiceMetadata } from "../../lib/seo/india-service-pages.ts";
import { canonicalIndiaServicePaths } from "../../lib/seo/canonical-india-services.ts";

const read = (path: string) => readFileSync(path, "utf8");
const route = read("app/buy-instagram-comments-india/page.tsx");
const guide = read("components/seo/InstagramCommentsBuyingGuide.tsx");
const landing = read("components/marketing/InstagramCommentsLanding.tsx");
const likesGuide = read("components/seo/InstagramLikesBuyingChecklist.tsx");
const viewsGuide = read("components/seo/InstagramViewsBuyingGuide.tsx");

test("Instagram Comments has one indexable canonical URL for broad and India buyer intent", () => {
  assert.equal(canonicalIndiaServicePaths["buy-instagram-comments-india"], "/buy-instagram-comments-india");
  const meta = getIndiaServiceMetadata("buy-instagram-comments-india");
  assert.equal(meta.alternates?.canonical, "https://www.getsocialrush.com/buy-instagram-comments-india");
  assert.deepEqual(meta.robots, { index: true, follow: true });
  assert.match(JSON.stringify(meta.title), /Buy Instagram Comments India/);
  assert.match(meta.description ?? "", /Buy Instagram comments for public posts or Reels in India/);
  assert.match(meta.description ?? "", /no-refill terms/);
  assert.match(route, /<InstagramCommentsBuyingGuide \/>/);
  assert.match(guide, /Before you buy Instagram comments in India/);
  assert.match(guide, /where to buy Instagram comments/);
});

test("Content and metadata reflect catalog pricing and honest delivery / refill terms", () => {
  const service = getServiceById("instagram-comments");
  assert.equal(service?.pricePer1000, 499);
  assert.equal(service?.minQuantity, 100);
  assert.equal(service?.maxQuantity, 10000);
  assert.equal(service?.deliveryTime, "1–24 hours");
  assert.equal(service?.refillPolicy, "No refill");
  assert.match(guide, /getServiceById\("instagram-comments"\)/);
  assert.match(guide, /indicative 1–24 hour delivery period and no refill/);
  assert.match(guide, /not guarantee that comments come from Indian accounts/);
  assert.match(guide, /live checkout remains authoritative/i);
  assert.match(landing, /Will these comments come from India/);
  assert.match(landing, /Can I choose the exact wording of comments/);
  assert.match(landing, /Does this comments service include refill support/);
  assert.match(landing, /Is buying Instagram comments risk-free/);
});

test("Page keeps original live order gating and adds contextual inbound links", () => {
  assert.match(route, /isOrderableInstagramCommentsService\(live\)/);
  assert.match(route, /<InstagramCommentsLanding live=\{live\} \/>/);
  assert.match(route, /<ServiceSearchDecisionGuide service="instagram-comments" \/>/);
  assert.match(landing, /getInstagramCommentsOrderReadiness\(live,/);
  assert.match(likesGuide, /href="\/buy-instagram-comments-india"/);
  assert.match(viewsGuide, /href="\/buy-instagram-comments-india"/);
  assert.doesNotMatch(route, /noindex|canonical.*instagram-likes/);
});
