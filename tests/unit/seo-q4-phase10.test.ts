import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("TikTok followers has one real canonical owner", () => {
  const canonical = read("lib/seo/canonical-india-services.ts");
  const owner = read("lib/seo/query-ownership.ts");
  const sitemap = read("app/sitemap.xml/route.ts");

  assert.match(canonical, /"buy-tiktok-followers-india": "\/tiktok-followers"/);
  assert.match(owner, /aliases: \["\/buy-tiktok-followers-india", "\/services\/tiktok-followers"\]/);
  assert.match(sitemap, /indiaServiceSlugs\.map\(sitemapServicePath\)/);
});

test("canonical TikTok followers page owns metadata and live service experience", () => {
  const page = read("app/tiktok-followers/page.tsx");
  assert.match(page, /title = "Buy TikTok Followers India \| Live INR Plans \| SocialRUSH"/);
  assert.match(page, /alternates: \{ canonical: path \}/);
  assert.match(page, /robots: \{ index: true, follow: true \}/);
  assert.match(page, /serviceCode="tiktok-followers"/);
  assert.match(page, /canonicalPath=\{path\}/);
});

test("legacy TikTok follower service route permanently redirects to the canonical page", () => {
  const alias = read("app/services/tiktok-followers/page.tsx");
  assert.match(alias, /permanentRedirect\("\/tiktok-followers"\)/);
  assert.doesNotMatch(alias, /PremiumCatalogServiceLanding/);
});

test("shared catalog landing can emit a caller-owned canonical URL", () => {
  const landing = read("components/marketing/services/PremiumCatalogServiceLanding.tsx");
  assert.match(landing, /canonicalPath\?: string/);
  assert.match(landing, /const resolvedCanonicalPath = canonicalPath \?\? `\/services\/\$\{service\.code\}`/);
  assert.match(landing, /const canonical = `\$\{SEO_SITE_URL\}\$\{resolvedCanonicalPath\}`/);
  assert.match(landing, /headline: "Buy TikTok Followers in India"/);
});
