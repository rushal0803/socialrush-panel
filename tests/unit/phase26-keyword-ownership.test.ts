import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  canonicalOwnerForPath,
  hasUniqueQueryOwnership,
  transactionalQueryOwners,
} from "../../lib/seo/query-ownership.ts";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

const ownedSupplementalPaths = [
  "/services/linkedin",
  "/services/twitter-x",
  "/services/tiktok",
  "/services/linkedin-usa-connections",
  "/services/linkedin-usa-post-likes",
  "/services/linkedin-usa-reposts",
  "/services/linkedin-usa-endorsements",
  "/services/linkedin-usa-group-members",
  "/services/linkedin-usa-followers",
  "/services/linkedin-usa-custom-comments",
  "/services/telegram-post-views",
  "/services/telegram-post-reactions",
  "/services/telegram-poll-votes",
  "/services/twitter-likes",
  "/services/twitter-views",
  "/services/twitter-retweets",
  "/services/twitter-crypto-followers",
  "/services/twitter-crypto-likes",
  "/services/twitter-crypto-retweets",
  "/services/twitter-crypto-custom-comments",
] as const;

const catalogOnlyTikTokPaths = [
  "/services/tiktok-likes",
  "/services/tiktok-views",
  "/services/tiktok-custom-comments",
  "/services/tiktok-story-views",
  "/services/tiktok-saves",
] as const;

test("Phase 26 gives each owned commercial intent one unique canonical target", () => {
  assert.equal(hasUniqueQueryOwnership(), true);
  assert.equal(
    new Set(transactionalQueryOwners.map((owner) => owner.canonicalPath)).size,
    transactionalQueryOwners.length,
  );
  for (const path of ownedSupplementalPaths) {
    assert.equal(canonicalOwnerForPath(path)?.canonicalPath, path, `${path} needs an explicit owner`);
  }
});

test("Phase 26 does not assign organic ownership to catalog-only noindex TikTok pages", () => {
  const sitemap = read("app/sitemap.xml/route.ts");
  const servicePage = read("app/services/[slug]/page.tsx");
  const clusters = read("lib/seo/content-clusters.ts");

  for (const path of catalogOnlyTikTokPaths) {
    assert.equal(canonicalOwnerForPath(path), undefined, `${path} should not own an organic intent`);
    assert.equal(sitemap.includes(`"${path}"`), false, `${path} should stay out of the sitemap`);
    assert.equal(clusters.includes(`href: "${path}"`), false, `${path} should stay out of the SEO authority graph`);
  }
  assert.match(servicePage, /catalogOnlyServiceSlugs/);
  assert.match(servicePage, /robots: \{ index: false, follow: true \}/);
});

test("Phase 26 separates platform catalog intent from broad growth intent", () => {
  const linkedin = read("app/services/linkedin/page.tsx");
  const twitter = read("app/services/twitter-x/page.tsx");
  const tiktok = read("app/services/tiktok/page.tsx");
  const telegram = read("app/services/telegram/page.tsx");

  for (const source of [linkedin, twitter, tiktok, telegram]) {
    assert.match(source, /Services Catalog/);
  }
  assert.doesNotMatch(linkedin, /keywords: \["LinkedIn growth services"/);
  assert.doesNotMatch(twitter, /keywords: \["Twitter growth services"/);
  assert.doesNotMatch(tiktok, /keywords: \["TikTok growth services"/);
  assert.doesNotMatch(telegram, /keywords: \["Telegram growth services"/);
});

test("Phase 26 preserves aliases as redirects rather than secondary owners", () => {
  for (const owner of transactionalQueryOwners) {
    for (const alias of owner.aliases) {
      assert.notEqual(alias, owner.canonicalPath);
      assert.equal(canonicalOwnerForPath(alias)?.canonicalPath, owner.canonicalPath);
    }
  }
});
