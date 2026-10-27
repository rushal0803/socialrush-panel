import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getServiceById } from "../../lib/smm-service-catalog.ts";
import { canonicalIndiaServicePaths } from "../../lib/seo/canonical-india-services.ts";
import { getIndiaServiceMetadata } from "../../lib/seo/india-service-pages.ts";
import { facebookGroupMembersFaqs } from "../../lib/seo/facebook-group-members-faq.ts";

const read = (path: string) => readFileSync(path, "utf8");
const route = read("app/(india-seo-services)/buy-facebook-group-members-india/page.tsx");
const shared = read("components/marketing/services/IndiaServiceLandingPage.tsx");
const workspace = read("components/marketing/FacebookGroupMembersWorkspace.tsx");
const guide = read("components/seo/FacebookGroupMembersBuyerGuide.tsx");

test("Facebook Group Members preserves its canonical India route and matching metadata", () => {
  const canonical = "/buy-facebook-group-members-india";
  assert.equal(canonicalIndiaServicePaths["buy-facebook-group-members-india"], canonical);
  const meta = getIndiaServiceMetadata("buy-facebook-group-members-india");
  assert.equal(String(meta.alternates?.canonical), "https://www.getsocialrush.com" + canonical);
  assert.match(String(meta.description), /Buy Facebook Group members in India/);
  assert.match(String(meta.description), /admin approvals/);
  assert.match(route, /getIndiaServiceMetadata\("buy-facebook-group-members-india"\)/);
  assert.match(route, /<IndiaServiceLandingPage slug="buy-facebook-group-members-india"/);
  assert.match(route, /<MoneyPageAuthorityLinks platform="facebook"/);
});

test("Canonical landing renders original server-readable buyer guidance without duplicate FAQ graphs", () => {
  assert.match(shared, /<FacebookGroupMembersWorkspace live=\{live\} buyerGuide=\{<FacebookGroupMembersBuyerGuide \/>\} \/>/);
  assert.match(workspace, /\{buyerGuide\}/);
  assert.match(guide, /Buy Facebook Group members in India: check the group link/);
  assert.match(guide, /facebook.com\/groups\/\.\.\./);
  assert.match(guide, /A private group is not automatically eligible/);
  assert.match(guide, /[Aa]dmin approvals/);
  assert.match(guide, /INR pricing for India does not mean every member is based in India/);
  assert.match(guide, /Meta may limit or remove inauthentic engagement/);
  assert.doesNotMatch(guide, /application\/ld\+json/);
});

test("Live catalog remains the only authority for Group Members pricing and quantity", () => {
  const service = getServiceById("facebook-group-members");
  assert.equal(service?.requiresLiveCatalogFacts, true);
  assert.equal(service?.minQuantity, 0);
  assert.equal(service?.maxQuantity, 0);
  assert.match(guide, /public catalog has placeholder quantity limits/);
  assert.match(guide, /Check that the active group-members service is available/);
  assert.match(workspace, /const service = live\?\.available \? live : null/);
  assert.match(workspace, /validateCampaignLink\(url, linkRules\["facebook-group-members"\]\)/);
  assert.match(workspace, /const order = \(\) => \{ if \(valid\)/);
  assert.match(workspace, /disabled=\{!valid\}/);
  assert.match(workspace, /SERVICE PREVIEW/);
});

test("Visible FAQs and FAQPage JSON-LD use the exact same static buyer answers", () => {
  assert.ok(facebookGroupMembersFaqs.length >= 8);
  const topics = ["private Facebook Group", "membership questions", "based in India", "engagement or sales"];
  for(const phrase of topics)assert.ok(facebookGroupMembersFaqs.some(([q])=>q.includes(phrase)), "missing FAQ: "+phrase);
  assert.match(shared, /facebookGroupMembersFaqs\.map\(\(\[name, text\]\)/);
  assert.match(workspace, /facebookGroupMembersFaqs\.map\(\(\[question, answer\]\)/);
  assert.match(shared, /"@type": "FAQPage"/);
});

test("Facebook Followers, Likes and Views link to the canonical group-member page", () => {
  for (const path of [
    "components/marketing/FacebookFollowersLanding.tsx",
    "components/marketing/FacebookLikesLanding.tsx",
    "components/marketing/FacebookViewsLanding.tsx",
  ]) {
    assert.match(read(path), /"\/buy-facebook-group-members-india"/, `missing inbound service link from ${path}`);
  }
});
