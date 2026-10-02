import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { instagramSerpProfiles } from "../../lib/seo/instagram-serp.ts";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 21 Instagram titles and descriptions are concise, human-readable and branded", () => {
  for (const profile of Object.values(instagramSerpProfiles)) {
    assert.ok(profile.title.length >= 45 && profile.title.length <= 60, profile.key + " title length " + profile.title.length);
    assert.ok(profile.description.length >= 120 && profile.description.length <= 160, profile.key + " description length " + profile.description.length);
    assert.match(profile.title, / in India \| INR Pricing \| SocialRUSH$/);
    assert.doesNotMatch(profile.title, /Live INR Plans|Live ₹ Plans|Best|Cheap|#1/i);
    assert.doesNotMatch(profile.description, /best|cheapest|guaranteed|instant results|limited time/i);
  }
});

test("all six canonical Instagram money pages use the shared SERP metadata source", () => {
  const expectations = [
    ["app/buy-instagram-followers-india/page.tsx", "followers"],
    ["app/(india-seo-services)/buy-instagram-likes-india/page.tsx", "likes"],
    ["app/(india-seo-services)/buy-instagram-views-india/page.tsx", "views"],
    ["app/buy-instagram-comments-india/page.tsx", "comments"],
    ["app/buy-instagram-saves-india/page.tsx", "saves"],
    ["app/buy-instagram-shares-india/page.tsx", "shares"],
  ] as const;
  for (const [path, key] of expectations) {
    const source = read(path);
    assert.ok(source.includes('buildInstagramSerpMetadata("' + key + '")') || source.includes('buildInstagramSerpMetadata("' + key + '",'), path);
  }
});

test("Phase 21 removes duplicate local breadcrumb/service schema where shared commercial schema already owns it", () => {
  const likes = read("app/(india-seo-services)/buy-instagram-likes-india/page.tsx");
  const saves = read("components/marketing/services/InstagramSavesLanding.tsx");
  const serviceLanding = read("components/marketing/services/IndiaServiceLandingPage.tsx");
  const followers = read("app/buy-instagram-followers-india/page.tsx");

  assert.doesNotMatch(likes, /const breadcrumbSchema/);
  assert.doesNotMatch(saves, /"@type": "BreadcrumbList"/);
  assert.match(saves, /"@type": "FAQPage"/);

  const start = serviceLanding.indexOf('if (slug === "buy-instagram-shares-india")');
  const end = serviceLanding.indexOf("  const available =", start);
  assert.ok(start >= 0 && end > start);
  const sharesBlock = serviceLanding.slice(start, end);
  assert.doesNotMatch(sharesBlock, /"@type": "BreadcrumbList"|"@type": "Service"/);
  assert.match(sharesBlock, /"@type": "FAQPage"/);
  assert.ok(followers.includes('name:"Instagram Growth",item:`${SEO_SITE_URL}/instagram-growth-india`'));
});
