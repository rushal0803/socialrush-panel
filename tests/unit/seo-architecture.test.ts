import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { activeSmmServices } from "../../lib/smm-service-catalog.ts";
import { canonicalIndiaServicePaths, getIndiaServiceMetadata, indiaServiceSlugs } from "../../lib/seo/india-service-pages.ts";
import { countryServicePaths, getPublishedCountryServicePage, publishedCountryServicePages } from "../../lib/seo/international.ts";
import { hasUniquePrimaryTargets, indexableInternationalPaths, isPublishedInternationalPath, protectedIndiaSeoPaths, seoIntentMap } from "../../lib/seo/architecture.ts";
import { createCountryServiceSchema } from "../../lib/seo/country-service-schema.ts";
import { contentClusters } from "../../lib/seo/content-clusters.ts";
import { articleSlugs } from "../../components/marketing/blog/blogData.ts";

const redirectedServicePaths = new Set([
  "/services/instagram-followers",
  "/services/instagram-likes",
  "/services/instagram-views",
  "/services/youtube-subscribers",
  "/services/youtube-likes",
  "/services/youtube-views",
]);

function metadataTitle(metadata: ReturnType<typeof getIndiaServiceMetadata>): string {
  const title = metadata.title;
  if (!title || typeof title === "string") return String(title ?? "");
  if ("absolute" in title) return String(title.absolute);
  if ("default" in title) return String(title.default);
  return "";
}

test("every deliberate SEO intent has exactly one preferred canonical target", () => {
  assert.equal(hasUniquePrimaryTargets(), true);
  assert.equal(seoIntentMap.every((intent) => intent.primaryTarget.startsWith("/") && !intent.primaryTarget.includes("?")), true);
});

test("protected India service targets remain present and canonical", () => {
  assert.equal(protectedIndiaSeoPaths.length, indiaServiceSlugs.length);
  for (const slug of indiaServiceSlugs) {
    const path = canonicalIndiaServicePaths[slug];
    assert.ok(protectedIndiaSeoPaths.includes(path));
    assert.ok(seoIntentMap.some((intent) => intent.primaryTarget === path && intent.protected));
  }
});

test("platform hubs link directly to canonical service pages", () => {
  const hubLinks = Object.values(contentClusters).flatMap((cluster) => cluster.serviceLinks.map((link) => link.href));
  for (const href of hubLinks) {
    assert.equal(redirectedServicePaths.has(href), false, `${href} should not require an internal redirect`);
  }
});

test("platform hubs link to published, unique authority guides", () => {
  const publishedArticles = new Set(articleSlugs);

  for (const cluster of Object.values(contentClusters)) {
    assert.ok(cluster.guideLinks.length >= 3, `${cluster.platform} needs a useful guide cluster`);
    assert.equal(
      new Set(cluster.guideLinks.map((link) => link.href)).size,
      cluster.guideLinks.length,
      `${cluster.platform} guide links should be unique`,
    );

    for (const guide of cluster.guideLinks) {
      assert.match(guide.href, /^\/blog\//);
      assert.ok(
        publishedArticles.has(guide.href.replace("/blog/", "")),
        `${guide.href} must resolve to a published article`,
      );
    }
  }
});

test("growth hubs expose crawlable authority-guide links", () => {
  const sharedHubSource = readFileSync(
    new URL("../../components/marketing/PlatformGrowthHub.tsx", import.meta.url),
    "utf8",
  );
  const authorityLinksSource = readFileSync(
    new URL("../../components/marketing/PlatformAuthorityLinks.tsx", import.meta.url),
    "utf8",
  );

  assert.match(sharedHubSource, /<PlatformAuthorityLinks platform=\{platform\}/);
  assert.match(authorityLinksSource, /cluster\.guideLinks\.map/);

  for (const [path, platform] of [
    ["../../app/instagram-growth-india/page.tsx", "instagram"],
    ["../../app/youtube-growth-india/page.tsx", "youtube"],
    ["../../app/facebook-growth-india/page.tsx", "facebook"],
  ] as const) {
    const source = readFileSync(new URL(path, import.meta.url), "utf8");
    assert.match(source, new RegExp(`<PlatformAuthorityLinks platform="${platform}"`));
  }

  const linkedinHubSource = readFileSync(
    new URL("../../app/linkedin-growth-india/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(linkedinHubSource, /\/blog\/linkedin-followers-vs-engagement-india/);
});

test("technical SEO routes avoid redirect loops and sitemap omissions", () => {
  const nextConfigSource = readFileSync(
    new URL("../../next.config.mjs", import.meta.url),
    "utf8",
  );
  const sitemapSource = readFileSync(
    new URL("../../app/sitemap.xml/route.ts", import.meta.url),
    "utf8",
  );
  const legacyLinkedinRoute = new URL(
    "../../app/blog/linkedin-growth-tips-for-personal-brands/page.tsx",
    import.meta.url,
  );

  assert.equal(existsSync(legacyLinkedinRoute), false);
  assert.ok(articleSlugs.includes("linkedin-growth-tips-personal-brands"));
  assert.match(
    nextConfigSource,
    /source:\s*"\/blog\/linkedin-growth-tips-for-personal-brands"[\s\S]{0,160}destination:\s*"\/blog\/linkedin-growth-tips-personal-brands"/,
  );
  assert.doesNotMatch(
    nextConfigSource,
    /source:\s*"([^"]+)"[\s\S]{0,160}destination:\s*"\1"/,
  );
  assert.match(sitemapSource, /"\/tools\/social-media-growth-audit"/);
  assert.match(sitemapSource, /"\/tools\/social-media-growth-planner"/);
  assert.match(sitemapSource, /async function getApprovedCaseStudies/);
  assert.match(sitemapSource, /catch \{/);
});

test("thin operational pages explicitly stay out of search results", () => {
  for (const path of [
    "../../app/status/page.tsx",
    "../../app/offline/page.tsx",
  ]) {
    const source = readFileSync(new URL(path, import.meta.url), "utf8");
    assert.match(source, /robots:\s*\{\s*index:\s*false/);
  }
});

test("priority India pages keep Search Console query language in metadata", () => {
  const youtube = getIndiaServiceMetadata("buy-youtube-subscribers-india", "/youtube-subscribers");
  const twitter = getIndiaServiceMetadata("buy-twitter-followers-india", "/twitter-followers");
  const facebook = getIndiaServiceMetadata("buy-facebook-followers-india", "/buy-facebook-followers-india");
  const linkedin = getIndiaServiceMetadata("buy-linkedin-followers-india", "/linkedin-followers");
  const tiktok = getIndiaServiceMetadata("buy-tiktok-followers-india", "/tiktok-followers");
  const telegram = getIndiaServiceMetadata("buy-telegram-members-india", "/telegram-members");
  const instagramLikes = getIndiaServiceMetadata("buy-instagram-likes-india", "/instagram-likes");
  const instagramViews = getIndiaServiceMetadata("buy-instagram-views-india", "/instagram-views");
  const instagramComments = getIndiaServiceMetadata("buy-instagram-comments-india", "/buy-instagram-comments-india");
  const instagramSaves = getIndiaServiceMetadata("buy-instagram-saves-india", "/buy-instagram-saves-india");
  const instagramShares = getIndiaServiceMetadata("buy-instagram-shares-india", "/buy-instagram-shares-india");
  const facebookLikes = getIndiaServiceMetadata("buy-facebook-likes-india", "/facebook-likes");
  const facebookViews = getIndiaServiceMetadata("buy-facebook-views-india", "/facebook-views");
  const facebookShares = getIndiaServiceMetadata("buy-facebook-shares-india", "/buy-facebook-shares-india");
  const facebookGroupMembers = getIndiaServiceMetadata("buy-facebook-group-members-india", "/buy-facebook-group-members-india");
  const youtubeViews = getIndiaServiceMetadata("buy-youtube-views-india", "/youtube-views");
  const youtubeLikes = getIndiaServiceMetadata("buy-youtube-likes-india", "/youtube-likes");
  const youtubeComments = getIndiaServiceMetadata("buy-youtube-comments-india", "/buy-youtube-comments-india");
  const linkedinLikes = getIndiaServiceMetadata("buy-linkedin-likes-india", "/linkedin-likes");
  const instagramSource = readFileSync(new URL("../../app/buy-instagram-followers-india/page.tsx", import.meta.url), "utf8");
  const instagramViewsSource = readFileSync(new URL("../../app/(india-seo-services)/buy-instagram-views-india/page.tsx", import.meta.url), "utf8");
  const middlewareSource = readFileSync(new URL("../../middleware.ts", import.meta.url), "utf8");
  const watchHoursSource = readFileSync(new URL("../../app/(india-seo-services)/buy-youtube-watch-hours-india/page.tsx", import.meta.url), "utf8");
  const canonicalServiceSource = readFileSync(new URL("../../app/(seo-services)/[service]/page.tsx", import.meta.url), "utf8");
  const youtubeLikesSource = readFileSync(new URL("../../app/(india-seo-services)/buy-youtube-likes-india/page.tsx", import.meta.url), "utf8");
  const youtubeEngagementSchemaSource = readFileSync(new URL("../../components/seo/YouTubeEngagementJsonLd.tsx", import.meta.url), "utf8");
  const indiaServiceSource = readFileSync(new URL("../../components/marketing/services/IndiaServiceLandingPage.tsx", import.meta.url), "utf8");

  assert.match(metadataTitle(youtube), /Buy YouTube Subscribers India/);
  assert.match(youtube.description ?? "", /live INR pricing/i);
  assert.match(metadataTitle(twitter), /Buy Twitter \(X\) Followers India/);
  assert.match(twitter.description ?? "", /Buy Twitter\/X followers in India/i);
  assert.match(metadataTitle(facebook), /Buy Facebook Followers India/);
  assert.match(facebook.description ?? "", /live INR pricing/i);
  assert.match(metadataTitle(linkedin), /Buy LinkedIn Followers India/);
  assert.match(linkedin.description ?? "", /LinkedIn followers in India/i);
  assert.match(metadataTitle(tiktok), /Buy TikTok Followers in India/);
  assert.match(tiktok.description ?? "", /TikTok followers in India/i);
  assert.match(metadataTitle(telegram), /Buy Telegram Members India \| Live INR Plans/);
  assert.match(telegram.description ?? "", /live INR pricing/i);
  for (const metadata of [instagramLikes, instagramViews, instagramComments, instagramSaves, instagramShares]) {
    assert.match(metadataTitle(metadata), /Buy Instagram (Likes|Views|Comments|Saves|Shares) India \| Live INR Plans/);
    assert.match(metadata.description ?? "", /live INR pricing/i);
  }
  assert.match(String(instagramLikes.alternates?.canonical), /\/instagram-likes$/);
  assert.match(String(instagramViews.alternates?.canonical), /\/instagram-views$/);
  assert.match(instagramViewsSource, /const path="\/instagram-views"/);
  for (const metadata of [facebookLikes, facebookViews, facebookShares, facebookGroupMembers]) {
    assert.match(metadataTitle(metadata), /Buy Facebook (Likes|Views|Shares|Group Members) India \| Live INR Plans/);
    assert.match(metadata.description ?? "", /live INR pricing/i);
  }
  assert.match(String(facebookShares.alternates?.canonical), /\/buy-facebook-shares-india$/);
  assert.match(middlewareSource, /"\/services\/facebook-shares": "\/buy-facebook-shares-india"/);
  assert.match(metadataTitle(linkedinLikes), /Buy LinkedIn Likes India \| Live INR Plans/);
  assert.match(linkedinLikes.description ?? "", /live INR pricing/i);
  assert.match(String(linkedinLikes.alternates?.canonical), /\/linkedin-likes$/);
  assert.match(instagramSource, /Buy Instagram Followers India \| Live ₹ Plans \| SocialRUSH/);
  assert.match(instagramSource, /How much do Instagram followers cost in India\?/);
  assert.match(watchHoursSource, /Buy YouTube Watch Hours India \| Live INR Plans \| SocialRUSH/);
  assert.match(watchHoursSource, /"@type": "FAQPage"/);
  for (const [metadata, canonical, service] of [
    [youtubeViews, "/youtube-views", "Views"],
    [youtubeLikes, "/youtube-likes", "Likes"],
    [youtubeComments, "/buy-youtube-comments-india", "Comments"],
  ] as const) {
    assert.match(metadataTitle(metadata), new RegExp(`Buy YouTube ${service} India \\| Live INR Plans`));
    assert.match(metadata.description ?? "", /live INR pricing/i);
    assert.match(String(metadata.alternates?.canonical), new RegExp(`${canonical}$`));
  }
  assert.match(canonicalServiceSource, /YouTubeEngagementJsonLd code="youtube-views"/);
  assert.match(youtubeLikesSource, /YouTubeEngagementJsonLd code="youtube-likes"/);
  assert.match(youtubeEngagementSchemaSource, /"@type": "Service"/);
  assert.match(youtubeEngagementSchemaSource, /priceCurrency: "INR"/);
  assert.match(youtubeEngagementSchemaSource, /areaServed: "IN"/);
  assert.match(youtubeEngagementSchemaSource, /<BreadcrumbJsonLd/);
  assert.match(indiaServiceSource, /name: "YouTube Comments India"/);
  assert.match(String(youtube.alternates?.canonical), /\/youtube-subscribers$/);
  assert.match(String(twitter.alternates?.canonical), /\/twitter-followers$/);
  assert.match(String(facebook.alternates?.canonical), /\/buy-facebook-followers-india$/);
  assert.match(String(linkedin.alternates?.canonical), /\/linkedin-followers$/);
  assert.match(String(tiktok.alternates?.canonical), /\/tiktok-followers$/);
  assert.match(String(telegram.alternates?.canonical), /\/telegram-members$/);
});

test("international routes are allowlisted, catalog-backed, and have no unpublished variants", () => {
  assert.deepEqual([...indexableInternationalPaths].sort(), [...new Set([...indexableInternationalPaths])].sort());
  for (const page of publishedCountryServicePages) {
    const path = `/${page.market.slug}/${page.serviceSlug}`;
    assert.ok(countryServicePaths.includes(path));
    assert.equal(isPublishedInternationalPath(path), true);
    assert.ok(activeSmmServices.some((service) => service.code === page.catalogServiceCode));
  }
  assert.equal(getPublishedCountryServicePage("sg", "buy-instagram-followers"), undefined);
  assert.equal(isPublishedInternationalPath("/sg/buy-instagram-followers"), false);
});

test("country service schema remains INR-authoritative", () => {
  for (const page of publishedCountryServicePages) {
    const service = activeSmmServices.find((candidate) => candidate.code === page.catalogServiceCode);
    assert.ok(service);
    const schema = createCountryServiceSchema(page, service);
    const offer = schema["@graph"].find((item) => item["@type"] === "Service")?.offers;
    assert.equal(offer?.priceCurrency, "INR");
    assert.notEqual(page.market.currency, "INR");
    assert.notEqual(offer?.priceCurrency, page.market.currency);
  }
});
