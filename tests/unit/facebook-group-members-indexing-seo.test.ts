import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { canonicalIndiaServicePaths } from "../../lib/seo/canonical-india-services.ts";
import { getIndiaServiceMetadata } from "../../lib/seo/india-service-pages.ts";
import { getServiceById } from "../../lib/smm-service-catalog.ts";
import { facebookGroupMembersFaqs } from "../../lib/seo/facebook-group-members-faq.ts";

const source = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");
const route = source("app/(india-seo-services)/buy-facebook-group-members-india/page.tsx");
const landing = source("components/marketing/services/IndiaServiceLandingPage.tsx");
const workspace = source("components/marketing/FacebookGroupMembersWorkspace.tsx");
const guide = source("components/seo/FacebookGroupMembersBuyerGuide.tsx");

test("Facebook Group Members retains its sole canonical indexable money page", () => {
  const canonical = "https://www.getsocialrush.com/buy-facebook-group-members-india";
  assert.equal(canonicalIndiaServicePaths["buy-facebook-group-members-india"], "/buy-facebook-group-members-india");
  const meta = getIndiaServiceMetadata("buy-facebook-group-members-india");
  assert.equal(meta.alternates?.canonical, canonical);
  assert.match(String(meta.title), /Facebook Group Members India/);
  assert.match(route, /getIndiaServiceMetadata\("buy-facebook-group-members-india"\)/);
  assert.match(route, /<IndiaServiceLandingPage slug="buy-facebook-group-members-india"/);
});

test("SSR content explains group-specific destination, privacy and live pricing without duplicating schemas", () => {
  assert.match(landing, /<FacebookGroupMembersWorkspace live=\{live\} buyerGuide=\{<FacebookGroupMembersBuyerGuide \/>\} \/>/);
  assert.match(workspace, /\{buyerGuide\}/);
  assert.match(guide, /Buy Facebook Group members in India: eligibility, privacy and live pricing/);
  assert.match(guide, /facebook.com\/groups\/\.\.\./);
  assert.match(guide, /approval-only or hidden group/);
  assert.match(guide, /Group admins keep control of membership/);
  assert.match(guide, /INR pricing does not mean India-only accounts/);
  assert.doesNotMatch(guide, /application\/ld\+json/);
});

test("Shared FAQs keep server FAQPage schema and rendered buyer questions in sync", () => {
  assert.equal(facebookGroupMembersFaqs.length, 9);
  assert.match(landing, /facebookGroupMembersFaqs\.map\(\(\[name, text\]\)/);
  assert.match(workspace, /\.\.\.facebookGroupMembersFaqs/);
  assert.match(landing, /"@type": "FAQPage"/);
  assert.ok(facebookGroupMembersFaqs.some(([q]) => q.includes("private or hidden")));
  assert.ok(facebookGroupMembersFaqs.some(([q]) => q.includes("admins")));
  assert.ok(facebookGroupMembersFaqs.some(([q]) => q.includes("only from India")));
});

test("Live catalog and gated group link validation are preserved", () => {
  const service = getServiceById("facebook-group-members");
  assert.equal(service?.requiresLiveCatalogFacts, true);
  assert.equal(service?.minQuantity, 0);
  assert.equal(service?.maxQuantity, 0);
  assert.match(workspace, /live\?\.available \? live : null/);
  assert.match(workspace, /validateCampaignLink\(url, linkRules\["facebook-group-members"\]\)/);
  assert.match(workspace, /disabled=\{!valid\}/);
  assert.match(workspace, /if \(valid\) window\.location\.assign/);
  assert.match(workspace, /SERVICE PREVIEW/);
  assert.match(guide, /public catalog has placeholder quantity limits/);
});

test("Other Facebook pages link directly to canonical Group Members guide", () => {
  for (const path of [
    "components/marketing/FacebookFollowersLanding.tsx",
    "components/marketing/FacebookLikesLanding.tsx",
    "components/marketing/FacebookViewsLanding.tsx",
  ]) {
    assert.match(source(path), /"\/buy-facebook-group-members-india"/, "Missing inbound link in " + path);
  }
});
