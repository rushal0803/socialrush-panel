import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getIndiaServiceMetadata } from "../../lib/seo/india-service-pages.ts";
import { canonicalIndiaServicePaths } from "../../lib/seo/canonical-india-services.ts";
import { getServiceById } from "../../lib/smm-service-catalog.ts";
import { facebookGroupMembersFaqs } from "../../lib/seo/facebook-group-members-faq.ts";

const read = (path: string) => readFileSync(path, "utf8");
const route = read("app/(india-seo-services)/buy-facebook-group-members-india/page.tsx");
const shared = read("components/marketing/services/IndiaServiceLandingPage.tsx");
const workspace = read("components/marketing/FacebookGroupMembersWorkspace.tsx");
const buyerGuide = read("components/seo/FacebookGroupMembersBuyerGuide.tsx");

test("Facebook Group Members maintains one canonical, indexable India service page", () => {
  assert.equal(canonicalIndiaServicePaths["buy-facebook-group-members-india"], "/buy-facebook-group-members-india");
  const meta = getIndiaServiceMetadata("buy-facebook-group-members-india");
  assert.equal(meta.alternates?.canonical, "https://www.getsocialrush.com/buy-facebook-group-members-india");
  assert.match(String(meta.description), /Buy Facebook Group Members in India/);
  assert.match(String(meta.description), /admin approval/);
  assert.match(route, /getIndiaServiceMetadata\("buy-facebook-group-members-india"\)/);
  assert.match(route, /<IndiaServiceLandingPage slug="buy-facebook-group-members-india"/);
});

test("Indexable buyer guide gives real Group URL and approval context", () => {
  assert.match(shared, /<FacebookGroupMembersWorkspace live=\{live\} buyerGuide=\{<FacebookGroupMembersBuyerGuide \/>\} \/>/);
  assert.match(workspace, /\{buyerGuide\}/);
  assert.match(buyerGuide, /Buy Facebook Group Members in India: links, approval settings and pricing/);
  assert.match(buyerGuide, /facebook.com\/groups\/\.\.\./);
  assert.match(buyerGuide, /Hidden, restricted, or approval-only groups/);
  assert.match(buyerGuide, /admin questions and approval settings/i);
  assert.match(buyerGuide, /does not provide a reliable fixed group-member rate or quantity range/);
  assert.match(buyerGuide, /Artificial or deceptive engagement may breach Meta rules/);
  assert.match(buyerGuide, /about.fb.com\/news\/2025\/11\/facebook-update-group-admins-flexibility-protecting-member-privacy/);
  assert.doesNotMatch(buyerGuide, /application\/ld\+json/);
});

test("Live catalog and existing group-link validator remain authoritative", () => {
  const service = getServiceById("facebook-group-members");
  assert.equal(service?.requiresLiveCatalogFacts, true);
  assert.equal(service?.minQuantity, 0);
  assert.equal(service?.maxQuantity, 0);
  assert.match(workspace, /const service = live\?\.available \? live : null/);
  assert.match(workspace, /validateCampaignLink\(url, linkRules\["facebook-group-members"\]\)/);
  assert.match(workspace, /Number\.isSafeInteger\(q\)/);
  assert.match(workspace, /const order = \(\) => \{ if \(valid\) window.location.assign/);
  assert.match(workspace, /disabled=\{!valid\}/);
  assert.match(workspace, /SERVICE PREVIEW/);
  assert.match(workspace, /\["Status",service\?"Configure order":"Service unavailable"\]/);
});

test("Visible FAQ and server-side JSON-LD use the same accurate answers", () => {
  assert.ok(facebookGroupMembersFaqs.length >= 8);
  assert.match(workspace, /\.\.\.facebookGroupMembersFaqs/);
  assert.match(shared, /facebookGroupMembersFaqs.map\(\(\[name, text\]\)/);
  assert.match(shared, /"@type": "FAQPage"/);
  assert.ok(facebookGroupMembersFaqs.some(([q]) => q.includes("admin approval")));
  assert.ok(facebookGroupMembersFaqs.some(([q]) => q.includes("guarantee Indian members")));
  assert.ok(facebookGroupMembersFaqs.some(([q]) => q.includes("pricing, quantity")));
});

test("Three contextual inbound links point to the Facebook Group Members canonical page", () => {
  for (const path of [
    "components/marketing/FacebookFollowersLanding.tsx",
    "components/marketing/FacebookLikesLanding.tsx",
    "components/marketing/FacebookViewsLanding.tsx",
  ]) {
    const source = read(path);
    assert.match(source, /\/buy-facebook-group-members-india/, `missing inbound link from ${path}`);
    assert.match(source, /Facebook Group Members/, `missing contextual anchor from ${path}`);
  }
});
