import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getIndiaServiceMetadata } from "../../lib/seo/india-service-pages.ts";
import { canonicalIndiaServicePaths } from "../../lib/seo/canonical-india-services.ts";
import { getServiceById } from "../../lib/smm-service-catalog.ts";

const read = (path: string) => readFileSync(path, "utf8");
const route = read("app/(india-seo-services)/buy-facebook-likes-india/page.tsx");
const guide = read("components/seo/FacebookLikesBuyerGuide.tsx");
const landing = read("components/marketing/FacebookLikesLanding.tsx");
const servicePages = read("lib/seo/india-service-pages.ts");

test("Facebook Likes uses the existing canonical indexable commercial landing", () => {
  assert.equal(canonicalIndiaServicePaths["buy-facebook-likes-india"], "/facebook-likes");
  const meta = getIndiaServiceMetadata("buy-facebook-likes-india");
  assert.equal(meta.alternates?.canonical, "https://www.getsocialrush.com/facebook-likes");
  assert.match(String(meta.description), /Buy Facebook Likes in India/);
  assert.match(servicePages, /Compare current INR pricing, link requirements, delivery and account-origin limitations/);
  assert.match(route, /getIndiaServiceMetadata\("buy-facebook-likes-india"\)/);
  assert.match(route, /path="\/facebook-likes"/);
  assert.match(route, /<FacebookLikesLanding buyerGuide=\{<FacebookLikesBuyerGuide \/>\} \/>/);
  assert.match(landing, /\{buyerGuide\}/);
});

test("Buyer's server-rendered decisions distinguish Facebook content, pages and Groups", () => {
  assert.match(guide, /Buy Facebook Likes in India: choose the right post/);
  assert.match(guide, /Post likes are not page likes or Group members/);
  assert.match(guide, /publicly accessible/);
  assert.match(guide, /quantity and the active catalog rate/);
  assert.match(guide, /does not guarantee real conversations/);
  assert.match(guide, /Meta platform policies/);
  assert.match(guide, /href="\/buy-facebook-group-members-india"/);
  assert.match(guide, /href="\/buy-facebook-followers-india"/);
  assert.doesNotMatch(guide, /application\/ld\+json/, "buyer guide should not duplicate existing service schema");
});

test("Facebook Likes checkout still reads exact service catalog pricing and URL rules", () => {
  const service = getServiceById("facebook-likes");
  assert.ok(service?.isActive);
  assert.ok(service?.pricePer1000 > 0);
  assert.ok(service?.minQuantity > 0);
  assert.match(landing, /getServiceById\("facebook-likes"\)/);
  assert.match(landing, /calculateServiceTotal/);
  assert.match(landing, /validateCampaignLink/);
  assert.match(landing, /linkRules/);
  assert.match(landing, /order/i);
});

test("Visible FAQs clarify geo-targeting, engagement and service differences", () => {
  assert.match(landing, /Are Facebook post Likes the same as Page followers or Group members\?/);
  assert.match(landing, /Are these Likes guaranteed to come from India\?/);
  assert.match(landing, /Will purchased Likes guarantee reach, sales or lasting engagement\?/);
  assert.match(landing, /do not guarantee that the accounts engaging with a post are Indian/);
  assert.match(landing, /Meta may limit or remove inauthentic engagement/);
  assert.doesNotMatch(landing, /Ã¢â‚¬â€/, "broken UTF-8 punctuation should be repaired");
});

test("Facebook Pages and Views recommend the canonical likes service", () => {
  for (const path of [
    "components/marketing/FacebookFollowersLanding.tsx",
    "components/marketing/FacebookViewsLanding.tsx",
  ]) assert.match(read(path), /"\/facebook-likes"/, `missing canonical Likes inbound link from ${path}`);
  assert.match(read("components/marketing/FacebookGroupMembersWorkspace.tsx"), /"\/facebook-likes"/);
});
