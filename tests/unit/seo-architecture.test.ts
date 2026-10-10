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
import { buildQuantityPlanning, serviceUnitFromCode } from "../../lib/seo/search-demand.ts";
import { getPlatformAuthorityTargets, uniqueAuthorityTargets } from "../../lib/seo/authority-graph.ts";
import { crawlPriorityServiceLinks, searchPlanningLinks } from "../../lib/seo/search-priority.ts";
import { buildCommercialSearchDescription } from "../../lib/seo/search-snippets.ts";
import { growthPlatformDecisionPoints, growthPlatformIndiaKeywords } from "../../lib/seo/growth-platform-intent.ts";
import { commercialCanonicalRedirects, hasUniqueQueryOwnership, isCommercialAliasPath, transactionalQueryOwners } from "../../lib/seo/query-ownership.ts";
import { PHASE5_AGENCY_RESELLER_UPDATE, PHASE5_PLATFORM_SMM_UPDATE, PHASE5_PRICING_INTENT_UPDATE, PHASE5_SAFE_ORDERING_UPDATE, PHASE5_SIGNIFICANT_UPDATE, PHASE5_SOCIAL_GROWTH_UPDATE, PHASE5_SOCIAL_SERVICES_UPDATE, phase5SearchFreshnessPaths, searchFreshnessLastmod } from "../../lib/seo/search-freshness.ts";
import { buildDeliveryRefillIntentCopy, deliveryRefillIntentKeywords } from "../../lib/seo/delivery-refill-intent.ts";
import { buildOrderRequirementCopy, orderRequirementIntentKeywords } from "../../lib/seo/order-requirements-intent.ts";
import { smmPanelIndiaCriteria, smmPanelIndiaKeywords, smmPanelPlatformSummary } from "../../lib/seo/smm-panel-intent.ts";
import { agencyResellerCriteria, agencyResellerIntentKeywords } from "../../lib/seo/agency-reseller-intent.ts";
import { socialEngagementIntentKeywords, socialEngagementServiceGroups } from "../../lib/seo/social-engagement-intent.ts";
import { socialPromotionCriteria, socialPromotionIntentKeywords } from "../../lib/seo/social-promotion-intent.ts";
import { socialMediaServicesIndiaKeywords, socialMediaServiceGroups } from "../../lib/seo/social-media-services-intent.ts";
import { smmSelectionChecklist, smmSelectionCriteria, smmSelectionIndiaKeywords } from "../../lib/seo/smm-selection-intent.ts";
import { platformSmmIntent, platformSmmKeywords } from "../../lib/seo/platform-smm-intent.ts";
import { priceForQuantity, smmPricingCriteria, smmPricingIndiaKeywords } from "../../lib/seo/smm-pricing-intent.ts";
import { safeSmmOrderingCriteria, safeSmmOrderingKeywords } from "../../lib/seo/safe-smm-ordering-intent.ts";
import { smmApiCriteria, smmApiIndiaKeywords } from "../../lib/seo/smm-api-intent.ts";
import { affordableSmmCriteria, affordableSmmFaqs, affordableSmmIndiaKeywords } from "../../lib/seo/affordable-smm-intent.ts";
import { bulkSmmDecisionPoints, bulkSmmFaqs, bulkSmmIndiaKeywords } from "../../lib/seo/bulk-smm-intent.ts";
import { hasUniqueInstagramGapTargets, implementedInstagramContentGapTargets, instagramContentGapCandidates } from "../../lib/seo/instagram-content-gap.ts";
import { hasUniqueLinkedInGapTargets, implementedLinkedInContentGapTargets, linkedInContentGapCandidates } from "../../lib/seo/linkedin-content-gap.ts";

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

test("Services hub directly links key commercial pages awaiting Google's first crawl", () => {
  const linkedPaths = new Set([...crawlPriorityServiceLinks, ...searchPlanningLinks].map((entry) => entry.href));

  for (const href of [
    "/buy-youtube-watch-hours-india",
    "/buy-youtube-comments-india",
    "/buy-instagram-comments-india",
    "/buy-facebook-group-members-india",
    "/buy-instagram-saves-india",
    "/buy-instagram-shares-india",
    "/facebook-views",
  ]) {
    assert.ok(linkedPaths.has(href), `${href} must be linked from Services without redirect aliases`);
  }
});

test("legacy growth planner URL redirects permanently to the published canonical tool", () => {
  const config = readFileSync(new URL("../../next.config.mjs", import.meta.url), "utf8");
  const catalog = readFileSync(new URL("../../lib/tools/catalog.ts", import.meta.url), "utf8");
  assert.match(
    config,
    /source: "\/tools\/social-media-growth-goal-planner"[\s\S]{0,140}destination: "\/tools\/creator-growth-goal-planner"[\s\S]{0,70}permanent: true/,
  );
  assert.match(catalog, /slug: "creator-growth-goal-planner"/);
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

test("free production SEO monitoring covers every canonical India service page", () => {
  const monitorSource = readFileSync(
    new URL("../../scripts/seo-health-check.mjs", import.meta.url),
    "utf8",
  );
  const workflowSource = readFileSync(
    new URL("../../.github/workflows/seo-health-monitor.yml", import.meta.url),
    "utf8",
  );

  for (const path of Object.values(canonicalIndiaServicePaths)) {
    assert.match(monitorSource, new RegExp(`\"${path}\"`));
  }
  assert.match(monitorSource, /canonical link is missing/);
  assert.match(monitorSource, /page is marked noindex/);
  assert.match(monitorSource, /sitemap\.xml contains/);
  assert.match(workflowSource, /cron: "35 3 \* \* 1"/);
  assert.match(workflowSource, /node scripts\/seo-health-check\.mjs/);
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
  assert.match(metadataTitle(twitter), /Buy X \/ Twitter Followers India/);
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
    assert.match(metadata.description ?? "", /live INR pricing|Compare .* in INR/i);
  }
  assert.match(String(instagramLikes.alternates?.canonical), /\/instagram-likes$/);
  assert.match(String(instagramViews.alternates?.canonical), /\/instagram-views$/);
  assert.match(instagramViewsSource, /const path="\/instagram-views"/);
  for (const metadata of [facebookLikes, facebookViews, facebookShares, facebookGroupMembers]) {
    assert.match(metadataTitle(metadata), /Buy Facebook (Likes|Views|Shares|Group Members) India \| Live INR Plans/);
    assert.match(metadata.description ?? "", /live INR pricing/i);
  }
  assert.match(String(facebookShares.alternates?.canonical), /\/buy-facebook-shares-india$/);
  assert.match(middlewareSource, /\.\.\.commercialCanonicalRedirects/);
  assert.equal(commercialCanonicalRedirects["/services/facebook-shares"], "/buy-facebook-shares-india");
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
  assert.equal(getPublishedCountryServicePage("zz", "buy-instagram-followers"), undefined);
  assert.equal(isPublishedInternationalPath("/zz/buy-instagram-followers"), false);
  assert.ok(getPublishedCountryServicePage("sg", "buy-instagram-followers"));
  assert.equal(isPublishedInternationalPath("/sg/buy-instagram-followers"), true);
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


test("search-demand quantity planning derives 1K 5K and 10K totals from the confirmed per-1K rate", () => {
  assert.deepEqual(buildQuantityPlanning(799), [
    { quantity: 1000, total: 799 },
    { quantity: 5000, total: 3995 },
    { quantity: 10000, total: 7990 },
  ]);
  assert.deepEqual(buildQuantityPlanning(null), []);
  assert.deepEqual(buildQuantityPlanning(0), []);
});

test("search-demand service units stay readable for long-tail price headings", () => {
  assert.equal(serviceUnitFromCode("instagram-followers"), "followers");
  assert.equal(serviceUnitFromCode("youtube-subscribers"), "subscribers");
  assert.equal(serviceUnitFromCode("telegram-members"), "members");
  assert.equal(serviceUnitFromCode("instagram-saves"), "saves");
});


test("platform authority graph routes research to clean canonical targets", () => {
  const publishedArticles = new Set(articleSlugs);

  for (const [platform, cluster] of Object.entries(contentClusters)) {
    const targets = getPlatformAuthorityTargets(platform as keyof typeof contentClusters);
    assert.ok(targets.length >= 4, `${platform} should expose a useful authority path`);
    assert.equal(targets[0]?.href, cluster.hubPath);
    assert.equal(targets[1]?.href, cluster.serviceLinks[0]?.href);
    assert.equal(new Set(targets.map((target) => target.href)).size, targets.length);

    for (const target of targets) {
      assert.match(target.href, /^\//);
      assert.equal(target.href.includes("?"), false, `${target.href} should remain a clean crawlable URL`);
      if (target.kind === "service") {
        assert.equal(redirectedServicePaths.has(target.href), false, `${target.href} should not require an internal redirect`);
      }
      if (target.kind === "guide") {
        assert.ok(publishedArticles.has(target.href.replace("/blog/", "")), `${target.href} must be a published guide`);
      }
    }
  }
});

test("authority graph deduplicates repeated destinations without changing order", () => {
  const targets = getPlatformAuthorityTargets("instagram");
  const first = targets[0];
  const second = targets[1];
  assert.ok(first);
  assert.ok(second);
  const deduped = uniqueAuthorityTargets([...targets, first, second]);
  assert.deepEqual(deduped.map((target) => target.href), targets.map((target) => target.href));
});

test("blog authority links stay canonical and avoid tracking-query crawl noise", () => {
  const blogSource = readFileSync(new URL("../../app/blog/[slug]/page.tsx", import.meta.url), "utf8");
  const bridgeSource = readFileSync(new URL("../../components/marketing/blog/ContentAuthorityBridge.tsx", import.meta.url), "utf8");

  assert.match(blogSource, /getGuideAuthorityTargets\(articlePlatform, `\/blog\/\$\{article\.slug\}`\)/);
  assert.match(blogSource, /authorityTargets\.map/);
  assert.match(blogSource, /authorityTargetHrefs\.has\(item\.href\)/);
  assert.match(bridgeSource, /getGuideAuthorityTargets/);
  assert.doesNotMatch(bridgeSource, /utm_source|utm_medium|utm_campaign|utm_content/);
  assert.doesNotMatch(bridgeSource, /\/services\/instagram|\/services\/youtube|\/services\/facebook|\/services\/twitter/);
});


test("phase 5F crawl priority points only to canonical India money pages", () => {
  const canonicalPaths = new Set(Object.values(canonicalIndiaServicePaths));
  assert.ok(crawlPriorityServiceLinks.length >= 6);
  assert.equal(new Set(crawlPriorityServiceLinks.map((item) => item.href)).size, crawlPriorityServiceLinks.length);
  for (const item of crawlPriorityServiceLinks) {
    assert.ok(canonicalPaths.has(item.href));
    assert.equal(item.href.includes("?"), false);
    assert.equal(redirectedServicePaths.has(item.href), false);
  }
  for (const item of searchPlanningLinks) {
    assert.match(item.href, /^\//);
    assert.equal(item.href.includes("?"), false);
  }
});

test("phase 5F commercial search descriptions cover price, public-link safety and tracking", () => {
  const description = buildCommercialSearchDescription({
    serviceName: "YouTube Subscribers",
    destination: "public YouTube channel link",
  });
  assert.match(description, /Buy YouTube Subscribers in India/);
  assert.match(description, /live INR pricing/i);
  assert.match(description, /quantity-based totals/i);
  assert.match(description, /public YouTube channel link/i);
  assert.match(description, /no password required/i);
  assert.match(description, /dashboard tracking/i);
  assert.ok(description.length <= 180);
});

test("homepage and services expose the canonical crawl-priority module", () => {
  const homepage = readFileSync(new URL("../../app/page.tsx", import.meta.url), "utf8");
  const services = readFileSync(new URL("../../app/services/page.tsx", import.meta.url), "utf8");
  assert.match(homepage, /<CrawlPriorityLinks \/>/);
  assert.match(services, /<CrawlPriorityLinks \/>/);
});


test("phase 5G gives every India transaction intent one canonical owner", () => {
  assert.equal(hasUniqueQueryOwnership(), true);
  const canonicalOwners = new Set(transactionalQueryOwners.map((owner) => owner.canonicalPath));
  for (const path of Object.values(canonicalIndiaServicePaths)) {
    assert.ok(canonicalOwners.has(path), `${path} should have a query owner`);
  }
  assert.ok(canonicalOwners.has("/buy-youtube-watch-hours-india"));
  assert.ok(canonicalOwners.has("/services"));
});

test("phase 5G commercial aliases always resolve to their single canonical owner", () => {
  for (const owner of transactionalQueryOwners) {
    assert.ok(owner.canonicalPath.startsWith("/"));
    assert.equal(owner.canonicalPath.includes("?"), false);
    for (const alias of owner.aliases) {
      assert.ok(alias.startsWith("/"));
      assert.notEqual(alias, owner.canonicalPath);
      assert.equal(commercialCanonicalRedirects[alias], owner.canonicalPath);
    }
  }
});

test("phase 5G middleware and sitemap consume the canonical ownership guard", () => {
  const middlewareSource = readFileSync(new URL("../../middleware.ts", import.meta.url), "utf8");
  const sitemapSource = readFileSync(new URL("../../app/sitemap.xml/route.ts", import.meta.url), "utf8");
  assert.match(middlewareSource, /commercialCanonicalRedirects/);
  assert.match(sitemapSource, /isCommercialAliasPath/);
  assert.match(sitemapSource, /filter\(\(route\) => !isCommercialAliasPath\(route\)\)/);
});

test("phase 5G production SEO monitor checks every commercial alias redirect", () => {
  const monitorSource = readFileSync(new URL("../../scripts/seo-health-check.mjs", import.meta.url), "utf8");
  for (const [alias, canonical] of Object.entries(commercialCanonicalRedirects)) {
    assert.ok(monitorSource.includes(`["${alias}", "${canonical}"]`), `${alias} redirect should be monitored`);
  }
});


test("phase 5H freshness registry marks only clean canonical-style paths with a real release date", () => {
  assert.equal(PHASE5_SIGNIFICANT_UPDATE, "2026-09-27");
  assert.equal(new Set(phase5SearchFreshnessPaths).size, phase5SearchFreshnessPaths.length);
  for (const path of phase5SearchFreshnessPaths) {
    assert.match(path, /^\//);
    assert.equal(path.includes("?"), false);
    assert.equal(isCommercialAliasPath(path), false, `${path} should not be a redirect alias`);
    if (path === "/for-agencies") assert.equal(searchFreshnessLastmod[path], PHASE5_AGENCY_RESELLER_UPDATE);
    else if (path === "/social-media-growth-india") assert.equal(searchFreshnessLastmod[path], PHASE5_SOCIAL_GROWTH_UPDATE);
    else if (path === "/services") assert.equal(searchFreshnessLastmod[path], PHASE5_SOCIAL_SERVICES_UPDATE);
    else if (path === "/pricing") assert.equal(searchFreshnessLastmod[path], PHASE5_PRICING_INTENT_UPDATE);
    else if (path === "/trust") assert.equal(searchFreshnessLastmod[path], PHASE5_SAFE_ORDERING_UPDATE);
    else if (["/tools/youtube-watch-time-calculator", "/tools/youtube-subscriber-growth-rate-calculator", "/tools/youtube-view-growth-rate-calculator", "/tools/youtube-engagement-rate-calculator", "/tools/instagram-follower-growth-rate-calculator", "/tools/instagram-reach-rate-calculator", "/tools/instagram-story-engagement-rate-calculator"].includes(path)) assert.equal(searchFreshnessLastmod[path], "2026-09-28");
    else if (["/tools/linkedin-engagement-rate-calculator", "/tools/instagram-engagement-rate-calculator"].includes(path)) assert.equal(searchFreshnessLastmod[path], "2026-09-29");
    else if (["/instagram-growth-india","/youtube-growth-india","/facebook-growth-india","/linkedin-growth-india","/x-growth-india","/tiktok-growth-india","/services/telegram"].includes(path)) assert.equal(searchFreshnessLastmod[path], PHASE5_PLATFORM_SMM_UPDATE);
    else assert.equal(searchFreshnessLastmod[path], PHASE5_SIGNIFICANT_UPDATE);
  }
});

test("phase 5H sitemap consumes explicit freshness instead of request-time dates", () => {
  const sitemapSource = readFileSync(new URL("../../app/sitemap.xml/route.ts", import.meta.url), "utf8");
  assert.match(sitemapSource, /searchFreshnessLastmod/);
  assert.match(sitemapSource, /Object\.entries\(searchFreshnessLastmod\)/);
  assert.doesNotMatch(sitemapSource, /new Date\(\)\.toISOString\(\).*lastmod/);
});

test("phase 5H IndexNow release submits canonical Phase 5 URLs only after the root key is live", () => {
  const submitter = readFileSync(new URL("../../scripts/indexnow-phase5-release.mjs", import.meta.url), "utf8");
  const workflow = readFileSync(new URL("../../.github/workflows/indexnow-phase5-release.yml", import.meta.url), "utf8");
  assert.match(submitter, /api\.indexnow\.org\/indexnow/);
  assert.match(submitter, /waitForKeyFile/);
  assert.match(submitter, /www\.getsocialrush\.com/);
  assert.match(submitter, /"\/pricing"/);
  assert.match(submitter, /"\/tools\/social-media-service-cost-calculator"/);
  assert.doesNotMatch(submitter, /\/dashboard|\/admin|\/api\//);
  assert.match(workflow, /branches: \[main\]/);
  assert.match(workflow, /node scripts\/indexnow-phase5-release\.mjs/);
});


test("phase 5J models delivery and refill long-tail search intent without guarantees", () => {
  assert.deepEqual(deliveryRefillIntentKeywords("Instagram Followers"), [
    "Instagram Followers delivery time India",
    "how long does Instagram Followers delivery take",
    "Instagram Followers refill India",
    "Instagram Followers refill policy",
  ]);

  const copy = buildDeliveryRefillIntentCopy({
    serviceName: "Instagram Followers",
    deliveryTime: "1-7 days",
    refillPolicy: "30 days refill",
  });
  assert.match(copy.heading, /delivery time and refill support in India/i);
  assert.match(copy.delivery, /estimate, not a guaranteed completion time/i);
  assert.match(copy.delivery, /1-7 days/);
  assert.match(copy.refill, /30 days refill/);
  assert.doesNotMatch(copy.delivery, /guaranteed delivery/i);
});

test("phase 5J priority money pages expose the visible delivery and refill intent module", () => {
  const files = [
    "../../app/buy-instagram-followers-india/page.tsx",
    "../../components/marketing/YouTubeSubscribersLanding.tsx",
    "../../components/marketing/LinkedInFollowersLanding.tsx",
    "../../components/marketing/FacebookFollowersLanding.tsx",
    "../../components/marketing/TwitterFollowersLanding.tsx",
    "../../components/marketing/TelegramFollowersLanding.tsx",
    "../../components/marketing/services/SeoServiceLandingPage.tsx",
    "../../components/marketing/services/IndiaServiceLandingPage.tsx",
  ];

  for (const path of files) {
    const source = readFileSync(new URL(path, import.meta.url), "utf8");
    assert.match(source, /DeliveryRefillIntentSection/);
  }
});

test("phase 5J metadata models include delivery and refill query language", () => {
  const indiaSource = readFileSync(new URL("../../lib/seo/india-service-pages.ts", import.meta.url), "utf8");
  const canonicalSource = readFileSync(new URL("../../lib/seo/service-landing-pages.ts", import.meta.url), "utf8");
  assert.match(indiaSource, /deliveryRefillIntentKeywords\(page\.serviceName\)/);
  assert.match(canonicalSource, /deliveryRefillIntentKeywords\(page\.displayName\)/);
});


test("phase 5K models minimum-order and quantity-limit search intent from catalog facts", () => {
  assert.deepEqual(orderRequirementIntentKeywords("Instagram Followers"), [
    "Instagram Followers minimum order India",
    "minimum Instagram Followers order",
    "Instagram Followers quantity limit India",
    "how many Instagram Followers can I buy",
    "public link required for Instagram Followers",
  ]);

  const copy = buildOrderRequirementCopy({
    serviceName: "Instagram Followers",
    minQuantity: 100,
    maxQuantity: 1000000,
    quantityStep: 1,
    destination: "public Instagram profile link",
  });
  assert.equal(copy.validLimits, true);
  assert.equal(copy.minQuantity, 100);
  assert.equal(copy.maxQuantity, 1000000);
  assert.equal(copy.quantityStep, 1);
  assert.match(copy.heading, /minimum order and quantity limits in India/i);

  const protectedCopy = buildOrderRequirementCopy({
    serviceName: "Protected Service",
    minQuantity: 0,
    maxQuantity: 0,
    destination: "public link",
  });
  assert.equal(protectedCopy.validLimits, false);
  assert.equal(protectedCopy.minQuantity, null);
  assert.equal(protectedCopy.maxQuantity, null);
});

test("phase 5K priority money pages expose the visible order-requirements module", () => {
  const files = [
    "../../app/buy-instagram-followers-india/page.tsx",
    "../../components/marketing/YouTubeSubscribersLanding.tsx",
    "../../components/marketing/LinkedInFollowersLanding.tsx",
    "../../components/marketing/FacebookFollowersLanding.tsx",
    "../../components/marketing/TwitterFollowersLanding.tsx",
    "../../components/marketing/TelegramFollowersLanding.tsx",
    "../../components/marketing/services/SeoServiceLandingPage.tsx",
    "../../components/marketing/services/IndiaServiceLandingPage.tsx",
  ];

  for (const path of files) {
    const source = readFileSync(new URL(path, import.meta.url), "utf8");
    assert.match(source, /OrderRequirementsIntentSection/);
  }
});

test("phase 5K metadata includes minimum-order search language", () => {
  const indiaSource = readFileSync(new URL("../../lib/seo/india-service-pages.ts", import.meta.url), "utf8");
  const canonicalSource = readFileSync(new URL("../../lib/seo/service-landing-pages.ts", import.meta.url), "utf8");
  assert.match(indiaSource, /orderRequirementIntentKeywords\(page\.serviceName\)/);
  assert.match(canonicalSource, /orderRequirementIntentKeywords\(page\.displayName\)/);
});


test("phase 5M assigns SMM panel India intent to the existing services canonical", () => {
  const owner = transactionalQueryOwners.find((item) => item.canonicalPath === "/services");
  assert.ok(owner);
  assert.match(owner.intent, /SMM panel India/i);
  assert.ok(owner.aliases.includes("/smm-panel-india"));
  assert.equal(commercialCanonicalRedirects["/smm-panel-india"], "/services");
  assert.ok(smmPanelIndiaKeywords.includes("social media growth services India"));
  assert.ok(smmPanelIndiaKeywords.includes("social media services with UPI India"));
});

test("phase 5M comparison model covers practical panel-selection criteria without ranking claims", () => {
  assert.deepEqual(smmPanelIndiaCriteria.map((item) => item.id), ["pricing", "payments", "requirements", "delivery"]);
  const summary = smmPanelPlatformSummary({ instagram: 6, youtube: 5, telegram: 0, linkedin: 2 });
  assert.deepEqual(summary, [
    { platform: "instagram", count: 6 },
    { platform: "youtube", count: 5 },
    { platform: "linkedin", count: 2 },
  ]);
  const copy = JSON.stringify(smmPanelIndiaCriteria);
  assert.doesNotMatch(copy, /best|cheapest|#1/i);
});

test("phase 5M legacy panel aliases remain consolidated without controlling visible services positioning", () => {
  const pageSource = readFileSync(new URL("../../app/services/page.tsx", import.meta.url), "utf8");
  assert.ok(commercialCanonicalRedirects["/smm-panel-india"] === "/services");
  assert.doesNotMatch(pageSource, /<SmmPanelIndiaAuthority/);
  assert.doesNotMatch(pageSource, /smmPanelIndiaKeywords/);
});


test("phase 5N assigns agency reseller intent to /for-agencies without a doorway page", () => {
  const owner = transactionalQueryOwners.find((item) => item.canonicalPath === "/for-agencies");
  assert.ok(owner);
  assert.match(owner.intent, /SMM reseller panel India/i);
  assert.ok(owner.aliases.includes("/smm-reseller-panel-india"));
  assert.ok(owner.aliases.includes("/smm-panel-for-agencies-india"));
  assert.equal(commercialCanonicalRedirects["/smm-reseller-panel-india"], "/for-agencies");
  assert.equal(commercialCanonicalRedirects["/smm-panel-for-agencies-india"], "/for-agencies");
  assert.ok(agencyResellerIntentKeywords.includes("social media growth platform for agencies India"));
  assert.ok(agencyResellerIntentKeywords.includes("agency social media growth services India"));
});

test("phase 5N agency intent model stays factual and avoids unsupported reseller claims", () => {
  assert.deepEqual(agencyResellerCriteria.map((item) => item.id), ["clients", "bulk", "monthly", "api"]);
  const copy = JSON.stringify(agencyResellerCriteria);
  assert.doesNotMatch(copy, /best|cheapest|#1|guaranteed profit|white-label child panel/i);
});

test("phase 5N /for-agencies exposes visible reseller authority and truthful freshness", () => {
  const pageSource = readFileSync(new URL("../../app/for-agencies/page.tsx", import.meta.url), "utf8");
  const authoritySource = readFileSync(new URL("../../components/marketing/audiences/AgencyResellerIntentSection.tsx", import.meta.url), "utf8");
  const monitorSource = readFileSync(new URL("../../scripts/seo-health-check.mjs", import.meta.url), "utf8");
  const indexNowSource = readFileSync(new URL("../../scripts/indexnow-phase5-release.mjs", import.meta.url), "utf8");
  assert.match(pageSource, /Social Media Growth Platform for Agencies India/);
  assert.match(pageSource, /<AgencyResellerIntentSection\/>/);
  assert.match(authoritySource, /Agency social media growth platform India/);
  assert.match(authoritySource, /agencyResellerCriteria\.map/);
  assert.match(JSON.stringify(agencyResellerCriteria), /Multi-client workspace/);
  assert.match(JSON.stringify(agencyResellerCriteria), /API documentation/);
  assert.match(authoritySource, /not a white-label panel/i);
  assert.match(monitorSource, /\["\/smm-reseller-panel-india", "\/for-agencies"\]/);
  assert.match(indexNowSource, /"\/for-agencies"/);
  assert.equal(searchFreshnessLastmod["/for-agencies"], "2026-09-28");
});


test("phase 5O assigns social media growth services India to one canonical hub", () => {
  const owner = transactionalQueryOwners.find((item) => item.canonicalPath === "/social-media-growth-india");
  assert.ok(owner);
  assert.equal(owner.intent, "social media growth, engagement and promotion services India");
  assert.ok(owner.aliases.includes("/social-media-growth-services-india"));
  assert.ok(owner.aliases.includes("/social-media-growth-service-india"));
  assert.equal(commercialCanonicalRedirects["/social-media-growth-services-india"], "/social-media-growth-india");
  assert.equal(commercialCanonicalRedirects["/social-media-growth-service-india"], "/social-media-growth-india");

  const servicesOwner = transactionalQueryOwners.find((item) => item.canonicalPath === "/services");
  assert.ok(servicesOwner);
  assert.doesNotMatch(servicesOwner.intent, /social media growth services/i);
});

test("phase 5O architecture and visible page own cross-platform growth intent without agency confusion", () => {
  const intent = seoIntentMap.find((item) => item.id === "social-media-growth-services-india");
  assert.ok(intent);
  assert.equal(intent.primaryTarget, "/social-media-growth-india");
  assert.equal(intent.platform, "cross-platform");

  const source = readFileSync(new URL("../../app/social-media-growth-india/page.tsx", import.meta.url), "utf8");
  assert.match(source, /Social Media Growth Services India/);
  assert.match(source, /Order-based growth services, not monthly social media management/i);
  assert.match(source, /monthly content creation, posting calendars, community management or ad-management retainers/i);
  assert.match(source, /UPI, Bank Transfer/);
  assert.match(source, /No social password is required/);
});

test("phase 5O marks the canonical growth hub fresh and submits it for search release", () => {
  assert.equal(PHASE5_SOCIAL_GROWTH_UPDATE, "2026-09-28");
  assert.equal(searchFreshnessLastmod["/social-media-growth-india"], PHASE5_SOCIAL_GROWTH_UPDATE);
  assert.ok(phase5SearchFreshnessPaths.includes("/social-media-growth-india"));

  const submitter = readFileSync(new URL("../../scripts/indexnow-phase5-release.mjs", import.meta.url), "utf8");
  const monitor = readFileSync(new URL("../../scripts/seo-health-check.mjs", import.meta.url), "utf8");
  assert.match(submitter, /"\/social-media-growth-india"/);
  assert.match(monitor, /"\/social-media-growth-india"/);
  assert.match(monitor, /"\/social-media-growth-services-india", "\/social-media-growth-india"/);
  assert.match(monitor, /"\/social-media-growth-service-india", "\/social-media-growth-india"/);
});


test("phase 5P consolidates social media engagement services India onto the growth hub", () => {
  const owner = transactionalQueryOwners.find((item) => item.canonicalPath === "/social-media-growth-india");
  assert.ok(owner);
  assert.match(owner.intent, /growth, engagement and promotion services India/i);
  assert.ok(owner.aliases.includes("/social-media-engagement-services-india"));
  assert.ok(owner.aliases.includes("/social-media-engagement-service-india"));
  assert.equal(commercialCanonicalRedirects["/social-media-engagement-services-india"], "/social-media-growth-india");
  assert.equal(commercialCanonicalRedirects["/social-media-engagement-service-india"], "/social-media-growth-india");
  assert.ok(socialEngagementIntentKeywords.includes("social media engagement services India"));
  assert.ok(socialEngagementIntentKeywords.includes("social media followers services India"));
});

test("phase 5P engagement model links only to clean canonical service paths", () => {
  assert.deepEqual(socialEngagementServiceGroups.map((group) => group.id), ["audience", "content", "interaction"]);
  for (const group of socialEngagementServiceGroups) {
    assert.ok(group.links.length >= 4);
    for (const link of group.links) {
      assert.match(link.href, /^\//);
      assert.equal(link.href.includes("?"), false);
      assert.equal(isCommercialAliasPath(link.href), false, link.href + " should be canonical");
    }
  }
});

test("phase 5P growth hub exposes visible engagement-service intent without outcome guarantees", () => {
  const source = readFileSync(new URL("../../app/social-media-growth-india/page.tsx", import.meta.url), "utf8");
  const monitor = readFileSync(new URL("../../scripts/seo-health-check.mjs", import.meta.url), "utf8");
  assert.match(source, /Social media engagement services India/i);
  assert.match(source, /socialEngagementServiceGroups\.map/);
  assert.deepEqual(socialEngagementServiceGroups.map(group => group.title), ["Followers, subscribers and members", "Likes, views and content engagement", "Comments, saves and shares"]);
  assert.match(source, /do not guarantee organic reach/i);
  assert.doesNotMatch(source, /100% safe|guaranteed reach|guaranteed sales|#1\b|cheapest/i);
  assert.match(monitor, /"\/social-media-engagement-services-india", "\/social-media-growth-india"/);
  assert.match(monitor, /"\/social-media-engagement-service-india", "\/social-media-growth-india"/);
  assert.equal(searchFreshnessLastmod["/social-media-growth-india"], "2026-09-28");
});


test("phase 5Q assigns social media promotion services India to the existing growth hub", () => {
  const owner = transactionalQueryOwners.find((item) => item.canonicalPath === "/social-media-growth-india");
  assert.ok(owner);
  assert.match(owner.intent, /promotion services India/i);
  assert.ok(owner.aliases.includes("/social-media-promotion-services-india"));
  assert.ok(owner.aliases.includes("/social-media-promotion-service-india"));
  assert.equal(commercialCanonicalRedirects["/social-media-promotion-services-india"], "/social-media-growth-india");
  assert.equal(commercialCanonicalRedirects["/social-media-promotion-service-india"], "/social-media-growth-india");
  assert.ok(socialPromotionIntentKeywords.includes("social media promotion services India"));
  assert.equal((socialEngagementIntentKeywords as readonly string[]).includes("social media promotion services India"), false);
});

test("phase 5Q promotion criteria distinguish campaign services from management retainers", () => {
  assert.deepEqual(socialPromotionCriteria.map((item) => item.id), ["audience", "content", "requirements", "scope"]);
  const copy = JSON.stringify(socialPromotionCriteria);
  assert.match(copy, /order-based growth and engagement campaigns/i);
  assert.match(copy, /not a monthly content creation/i);
  assert.doesNotMatch(copy, /guaranteed reach|guaranteed sales|best|cheapest|#1/i);
  for (const item of socialPromotionCriteria) {
    assert.match(item.href, /^\//);
    assert.equal(item.href.includes("?"), false);
  }
});

test("phase 5Q growth hub exposes visible promotion intent and canonical redirect monitoring", () => {
  const source = readFileSync(new URL("../../app/social-media-growth-india/page.tsx", import.meta.url), "utf8");
  const monitor = readFileSync(new URL("../../scripts/seo-health-check.mjs", import.meta.url), "utf8");
  const indexNow = readFileSync(new URL("../../scripts/indexnow-phase5-release.mjs", import.meta.url), "utf8");
  assert.match(source, /Social media promotion services India/i);
  assert.match(source, /order-based audience and engagement campaigns/i);
  assert.match(source, /does not mean full social media management/i);
  assert.match(source, /do not guarantee organic reach/i);
  assert.match(monitor, /"\/social-media-promotion-services-india", "\/social-media-growth-india"/);
  assert.match(monitor, /"\/social-media-promotion-service-india", "\/social-media-growth-india"/);
  assert.match(indexNow, /"\/social-media-growth-india"/);
  assert.equal(searchFreshnessLastmod["/social-media-growth-india"], "2026-09-28");
});


test("phase 5R keeps social media services India on the existing services canonical", () => {
  const owner = transactionalQueryOwners.find((item) => item.id === "social-media-services-india");
  assert.ok(owner);
  assert.equal(owner.canonicalPath, "/services");
  assert.ok(owner.aliases.includes("/social-media-services-india"));
  assert.equal(commercialCanonicalRedirects["/social-media-services-india"], "/services");
  assert.ok(socialMediaServicesIndiaKeywords.includes("social media services India"));
  assert.ok(socialMediaServiceGroups.length >= 3);
  const hrefs = socialMediaServiceGroups.flatMap((group) => group.links.map((link) => link.href));
  assert.equal(hrefs.every((href) => href.startsWith("/") && !href.includes("?")), true);
  assert.equal(new Set(hrefs).size, hrefs.length);
});

test("phase 5R services page exposes visible social media services India authority", () => {
  const source = readFileSync(new URL("../../app/services/page.tsx", import.meta.url), "utf8");
  const component = readFileSync(new URL("../../components/marketing/services/SocialMediaServicesIndiaAuthority.tsx", import.meta.url), "utf8");
  const monitor = readFileSync(new URL("../../scripts/seo-health-check.mjs", import.meta.url), "utf8");
  assert.match(source, /SocialMediaServicesIndiaAuthority/);
  assert.match(source, /socialMediaServicesIndiaKeywords/);
  assert.match(component, /Social media services India/);
  assert.match(component, /not a monthly social media management agency/i);
  assert.match(monitor, /social-media-services-india/);
});


test("phase 5S consolidates best reliable and trusted SMM panel India queries onto /services", () => {
  const owner = transactionalQueryOwners.find((item) => item.id === "social-media-services-india");
  assert.ok(owner);
  for (const alias of ["/best-smm-panel-india", "/reliable-smm-panel-india", "/trusted-smm-panel-india"]) {
    assert.ok(owner.aliases.includes(alias));
    assert.equal(commercialCanonicalRedirects[alias], "/services");
  }
  assert.ok(smmSelectionIndiaKeywords.includes("best social media growth platform India"));
  assert.ok(smmSelectionIndiaKeywords.includes("reliable social media growth services India"));
  assert.ok(smmSelectionIndiaKeywords.includes("trusted social media growth services India"));
});

test("phase 5S selection model uses factual criteria instead of self-awarded ranking claims", () => {
  assert.deepEqual(smmSelectionChecklist().map((item) => item.id), ["pricing", "payments", "requirements", "delivery", "tracking"]);
  const copy = JSON.stringify(smmSelectionCriteria);
  assert.match(copy, /INR pricing/i);
  assert.match(copy, /UPI|bank transfer/i);
  assert.match(copy, /public.*link/i);
  assert.match(copy, /delivery/i);
  assert.match(copy, /order status/i);
  assert.doesNotMatch(copy, /SocialRUSH is the best|#1|cheapest|guaranteed/i);
});

test("phase 5S legacy selection aliases remain monitored while visible services copy stays brand-safe", () => {
  const source = readFileSync(new URL("../../app/services/page.tsx", import.meta.url), "utf8");
  const monitor = readFileSync(new URL("../../scripts/seo-health-check.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, /<SmmSelectionAuthority/);
  assert.doesNotMatch(source, /smmSelectionIndiaKeywords/);
  assert.match(monitor, /"\/best-smm-panel-india", "\/services"/);
  assert.match(monitor, /"\/reliable-smm-panel-india", "\/services"/);
  assert.match(monitor, /"\/trusted-smm-panel-india", "\/services"/);
});


test("phase 5T assigns platform SMM panel queries to existing canonical hubs", () => {
  const expected = {
    instagram: "/instagram-growth-india",
    youtube: "/youtube-growth-india",
    linkedin: "/linkedin-growth-india",
    facebook: "/facebook-growth-india",
    twitter: "/x-growth-india",
    tiktok: "/tiktok-growth-india",
    telegram: "/services/telegram",
  } as const;

  for (const [platform, canonicalPath] of Object.entries(expected)) {
    const intent = platformSmmIntent[platform as keyof typeof platformSmmIntent];
    assert.match(intent.primaryKeyword, /growth services India/i);
    const owner = transactionalQueryOwners.find((item) => item.canonicalPath === canonicalPath);
    assert.ok(owner, `${canonicalPath} should own a platform SMM query family`);
    for (const alias of intent.aliases) {
      assert.equal(commercialCanonicalRedirects[alias], canonicalPath);
    }
  }
  assert.match(platformSmmKeywords("instagram")[0] || "", /Instagram growth services India/);
  assert.match(platformSmmKeywords("twitter")[0] || "", /Twitter \/ X growth services India/);
});

test("phase 5T renders platform SMM authority on every target hub", () => {
  const component = readFileSync(new URL("../../components/seo/PlatformSmmIntentSection.tsx", import.meta.url), "utf8");
  assert.match(component, /Compare .* services from one canonical India hub/);
  assert.match(component, /does not claim universal/);
  assert.match(component, /contentClusters\[platform\]/);

  for (const path of [
    "../../app/instagram-growth-india/page.tsx",
    "../../app/youtube-growth-india/page.tsx",
    "../../app/facebook-growth-india/page.tsx",
    "../../app/linkedin-growth-india/page.tsx",
    "../../components/marketing/PlatformGrowthHub.tsx",
    "../../app/services/telegram/page.tsx",
  ]) {
    const source = readFileSync(new URL(path, import.meta.url), "utf8");
    assert.match(source, /PlatformSmmIntentSection/);
  }
});


test("phase 5U assigns SMM pricing and UPI intent to /pricing", () => {
  const owner = transactionalQueryOwners.find((item) => item.id === "smm-pricing-india");
  assert.ok(owner);
  assert.equal(owner.canonicalPath, "/pricing");
  assert.match(owner.intent, /SMM panel price list India/i);
  for (const alias of [
    "/smm-panel-price-list-india",
    "/smm-panel-pricing-india",
    "/smm-panel-rates-india",
    "/upi-smm-panel-india",
    "/smm-panel-with-upi-india",
  ]) {
    assert.ok(owner.aliases.includes(alias));
    assert.equal(commercialCanonicalRedirects[alias], "/pricing");
  }
  assert.ok(smmPricingIndiaKeywords.includes("social media service price list India"));
  assert.ok(smmPricingIndiaKeywords.includes("social media services with UPI India"));
});

test("phase 5U pricing model stays factual and derives quantity totals", () => {
  assert.deepEqual(smmPricingCriteria.map((item) => item.id), ["rate", "quantity", "payment", "support"]);
  assert.equal(priceForQuantity(799, 1000), 799);
  assert.equal(priceForQuantity(799, 5000), 3995);
  assert.equal(priceForQuantity(0, 1000), null);
  const copy = JSON.stringify(smmPricingCriteria);
  assert.match(copy, /current per-1,000 rate/i);
  assert.match(copy, /UPI where available/i);
  assert.doesNotMatch(copy, /best|cheapest|#1|guaranteed/i);
});

test("phase 5U pricing page exposes visible SMM price-list authority and release safeguards", () => {
  const pricing = readFileSync(new URL("../../app/pricing/page.tsx", import.meta.url), "utf8");
  const authority = readFileSync(new URL("../../components/marketing/pricing/SmmPricingIndiaAuthority.tsx", import.meta.url), "utf8");
  const monitor = readFileSync(new URL("../../scripts/seo-health-check.mjs", import.meta.url), "utf8");
  const indexNow = readFileSync(new URL("../../scripts/indexnow-phase5-release.mjs", import.meta.url), "utf8");

  assert.match(pricing, /Social Media Service Price List India \| Live INR Rates/);
  assert.match(pricing, /<SmmPricingIndiaAuthority \/>/);
  assert.match(authority, /Social media service pricing in India/i);
  assert.match(authority, /including UPI where applicable/i);
  assert.match(authority, /Treat checkout as the final authority/i);
  assert.match(monitor, /"\/smm-panel-price-list-india", "\/pricing"/);
  assert.match(monitor, /"\/smm-panel-with-upi-india", "\/pricing"/);
  assert.match(indexNow, /"\/pricing"/);
  assert.equal(PHASE5_PRICING_INTENT_UPDATE, "2026-09-28");
  assert.equal(searchFreshnessLastmod["/pricing"], PHASE5_PRICING_INTENT_UPDATE);
});


test("phase 5V assigns safe no-password SMM ordering intent to /trust", () => {
  const owner = transactionalQueryOwners.find((item) => item.id === "safe-smm-ordering-india");
  assert.ok(owner);
  assert.equal(owner.canonicalPath, "/trust");
  assert.match(owner.intent, /safe SMM ordering India/i);
  for (const alias of [
    "/safe-smm-panel-india",
    "/smm-panel-without-password-india",
    "/no-password-smm-panel-india",
    "/public-link-smm-panel-india",
  ]) {
    assert.ok(owner.aliases.includes(alias));
    assert.equal(commercialCanonicalRedirects[alias], "/trust");
  }
  assert.ok(safeSmmOrderingKeywords.includes("social media services without password India"));
  assert.ok(safeSmmOrderingKeywords.includes("public link social media services India"));
});

test("phase 5V safe-ordering model uses verifiable checks instead of ranking claims", () => {
  assert.deepEqual(safeSmmOrderingCriteria.map((item) => item.id), ["public-link", "credentials", "checkout", "tracking"]);
  const copy = JSON.stringify(safeSmmOrderingCriteria);
  assert.match(copy, /public profile|public.*link/i);
  assert.match(copy, /password|OTP|recovery code/i);
  assert.match(copy, /official SocialRUSH checkout/i);
  assert.match(copy, /Orders area/i);
  assert.doesNotMatch(copy, /safest|best|#1|cheapest|guaranteed/i);
});

test("phase 5V Trust Center exposes visible no-password authority and release safeguards", () => {
  const page = readFileSync(new URL("../../app/trust/page.tsx", import.meta.url), "utf8");
  const authority = readFileSync(new URL("../../components/marketing/trust/SafeSmmOrderingAuthority.tsx", import.meta.url), "utf8");
  const monitor = readFileSync(new URL("../../scripts/seo-health-check.mjs", import.meta.url), "utf8");
  const indexNow = readFileSync(new URL("../../scripts/indexnow-phase5-release.mjs", import.meta.url), "utf8");

  assert.match(page, /Safe Social Media Growth Ordering India \| SocialRUSH/);
  assert.match(page, /<SafeSmmOrderingAuthority \/>/);
  assert.match(authority, /What “no password required” should mean/i);
  assert.match(authority, /does not need your social-media password, OTP or recovery code/i);
  assert.match(authority, /does not mean a platform outcome is guaranteed/i);
  assert.doesNotMatch(authority, /SocialRUSH is the safest|#1\b|cheapest/i);

  assert.equal(PHASE5_SAFE_ORDERING_UPDATE, "2026-09-28");
  assert.equal(searchFreshnessLastmod["/trust"], PHASE5_SAFE_ORDERING_UPDATE);
  assert.ok(phase5SearchFreshnessPaths.includes("/trust"));
  assert.match(indexNow, /"\/trust"/);
  assert.match(monitor, /"\/trust"/);
  assert.match(monitor, /"\/safe-smm-panel-india", "\/trust"/);
  assert.match(monitor, /"\/smm-panel-without-password-india", "\/trust"/);
  assert.match(monitor, /"\/no-password-smm-panel-india", "\/trust"/);
  assert.match(monitor, /"\/public-link-smm-panel-india", "\/trust"/);
});


test("phase 5W assigns SMM API India intent to the existing agency canonical", () => {
  const owner = transactionalQueryOwners.find((item) => item.id === "agency-reseller-panel-india");
  assert.ok(owner);
  assert.equal(owner.canonicalPath, "/for-agencies");
  assert.match(owner.intent, /SMM panel API India/i);
  for (const alias of ["/smm-panel-api-india", "/smm-reseller-api-india", "/smm-api-india"]) {
    assert.ok(owner.aliases.includes(alias));
    assert.equal(commercialCanonicalRedirects[alias], "/for-agencies");
  }
  assert.ok(smmApiIndiaKeywords.includes("social media growth API India"));
  assert.ok(smmApiIndiaKeywords.includes("agency social media API India"));
});

test("phase 5W API model uses only documented workflow capabilities", () => {
  assert.deepEqual(smmApiCriteria.map((item) => item.id), ["auth", "create", "status", "limits"]);
  const copy = JSON.stringify(smmApiCriteria);
  assert.match(copy, /Bearer token/i);
  assert.match(copy, /service identifier/i);
  assert.match(copy, /order ID/i);
  assert.match(copy, /120 requests per minute/i);
  assert.doesNotMatch(copy, /white-label|guaranteed profit|cheapest|#1/i);
});

test("phase 5W agency page exposes visible SMM API authority and monitored aliases", () => {
  const page = readFileSync(new URL("../../app/for-agencies/page.tsx", import.meta.url), "utf8");
  const authority = readFileSync(new URL("../../components/marketing/audiences/SmmApiIndiaAuthority.tsx", import.meta.url), "utf8");
  const apiDocs = readFileSync(new URL("../../app/dashboard/api-docs/page.tsx", import.meta.url), "utf8");
  const monitor = readFileSync(new URL("../../scripts/seo-health-check.mjs", import.meta.url), "utf8");

  assert.match(page, /Social Media Growth Platform for Agencies India/);
  assert.match(page, /<SmmApiIndiaAuthority\/>/);
  assert.match(authority, /Social media growth API India/i);
  assert.match(authority, /authenticated API documentation/i);
  assert.match(authority, /does not guarantee service availability/i);
  assert.match(apiDocs, /Authorization: Bearer YOUR_API_KEY/);
  assert.match(apiDocs, /120 requests per minute/);
  assert.match(monitor, /"\/smm-panel-api-india", "\/for-agencies"/);
  assert.match(monitor, /"\/smm-reseller-api-india", "\/for-agencies"/);
  assert.match(monitor, /"\/smm-api-india", "\/for-agencies"/);
  assert.equal(searchFreshnessLastmod["/for-agencies"], "2026-09-28");
});


test("phase 5X assigns cheap and affordable SMM India intent to /pricing", () => {
  const owner = transactionalQueryOwners.find((item) => item.id === "smm-pricing-india");
  assert.ok(owner);
  assert.equal(owner.canonicalPath, "/pricing");
  assert.match(owner.intent, /affordable SMM panel India/i);
  for (const alias of [
    "/cheap-smm-panel-india",
    "/affordable-smm-panel-india",
    "/low-cost-smm-panel-india",
    "/budget-smm-panel-india",
  ]) {
    assert.ok(owner.aliases.includes(alias));
    assert.equal(commercialCanonicalRedirects[alias], "/pricing");
  }
  assert.ok(affordableSmmIndiaKeywords.includes("cheap social media services India"));
  assert.ok(affordableSmmIndiaKeywords.includes("affordable social media growth services India"));
});

test("phase 5X affordability model compares real campaign cost without ranking claims", () => {
  assert.deepEqual(affordableSmmCriteria.map((item) => item.id), ["unit-cost", "minimum", "terms", "checkout"]);
  const copy = JSON.stringify({ criteria: affordableSmmCriteria, faqs: affordableSmmFaqs() });
  assert.match(copy, /current INR rate/i);
  assert.match(copy, /minimum order/i);
  assert.match(copy, /delivery.*refill|refill.*delivery/i);
  assert.match(copy, /final checkout total/i);
  assert.match(copy, /does not claim a universal cheapest ranking/i);
  assert.doesNotMatch(copy, /India.?s cheapest|#1|guaranteed lowest|lowest price guaranteed/i);
});

test("phase 5X pricing page exposes visible affordable SMM authority and monitored aliases", () => {
  const page = readFileSync(new URL("../../app/pricing/page.tsx", import.meta.url), "utf8");
  const authority = readFileSync(new URL("../../components/marketing/pricing/AffordableSmmIndiaAuthority.tsx", import.meta.url), "utf8");
  const monitor = readFileSync(new URL("../../scripts/seo-health-check.mjs", import.meta.url), "utf8");
  const indexNow = readFileSync(new URL("../../scripts/indexnow-phase5-release.mjs", import.meta.url), "utf8");

  assert.match(page, /Compare SocialRUSH social media growth pricing in India/i);
  assert.match(page, /<AffordableSmmIndiaAuthority \/>/);
  assert.match(authority, /Affordable social media growth services India/i);
  assert.match(authority, /Compare the live INR rate with the quantity you can actually order/i);
  assert.match(authority, /does not claim to be universally the cheapest/i);
  assert.doesNotMatch(authority, /India.?s cheapest|#1 SMM|guaranteed lowest/i);

  for (const alias of [
    "/cheap-smm-panel-india",
    "/affordable-smm-panel-india",
    "/low-cost-smm-panel-india",
    "/budget-smm-panel-india",
  ]) {
    assert.match(monitor, new RegExp(`"${alias.replaceAll("/", "\\/")}", "\\/pricing"`));
  }
  assert.match(indexNow, /"\/pricing"/);
  assert.equal(searchFreshnessLastmod["/pricing"], "2026-09-28");
});


test("phase 5Y services canonical uses brand-safe growth-platform authority", () => {
  const source = readFileSync(new URL("../../app/services/page.tsx", import.meta.url), "utf8");
  const authority = readFileSync(new URL("../../components/marketing/services/GrowthPlatformIndiaAuthority.tsx", import.meta.url), "utf8");
  assert.match(source, /GrowthPlatformIndiaAuthority/);
  assert.match(source, /growthPlatformIndiaKeywords/);
  assert.doesNotMatch(source, /smmPanelIndiaKeywords|smmSelectionIndiaKeywords/);
  assert.match(authority, /SocialRUSH growth platform/);
  assert.match(authority, /social media growth services in India/i);
  assert.match(authority, /public-link ordering/i);
  assert.match(authority, /Agency workflows/);
});

test("phase 5Y growth-platform intent covers commercial discovery without ranking claims", () => {
  assert.ok(growthPlatformIndiaKeywords.includes("social media growth platform India"));
  assert.ok(growthPlatformIndiaKeywords.includes("social media growth services with UPI India"));
  assert.deepEqual(growthPlatformDecisionPoints.map((item) => item.id), ["platform", "pricing", "safety", "tracking"]);
  const copy = JSON.stringify({ growthPlatformIndiaKeywords, growthPlatformDecisionPoints });
  assert.doesNotMatch(copy, /#1|guaranteed ranking|cheapest platform/i);
});


test("phase 5Z maps bulk SMM search intent to the existing agency canonical", () => {
  const owner = transactionalQueryOwners.find((item) => item.id === "agency-reseller-panel-india");
  assert.ok(owner);
  assert.equal(owner.canonicalPath, "/for-agencies");
  for (const alias of [
    "/bulk-smm-orders-india",
    "/bulk-smm-services-india",
    "/bulk-social-media-services-india",
    "/agency-social-media-fulfillment-india",
  ]) {
    assert.ok(owner.aliases.includes(alias));
    assert.equal(commercialCanonicalRedirects[alias], "/for-agencies");
  }
  assert.equal(hasUniqueQueryOwnership(), true);
});

test("phase 5Z bulk intent copy stays operational and avoids unsupported reseller claims", () => {
  assert.ok(bulkSmmIndiaKeywords.includes("bulk SMM orders India"));
  assert.ok(bulkSmmIndiaKeywords.includes("bulk social media services India"));
  assert.equal(bulkSmmDecisionPoints.length, 4);
  const copy = bulkSmmDecisionPoints.map((item) => item.text).join(" ");
  assert.match(copy, /active SocialRUSH catalog/i);
  assert.match(copy, /review/i);
  const faqCopy = bulkSmmFaqs().map((item) => item.answer).join(" ");
  assert.match(faqCopy, /No automatic bulk or wholesale discount is promised/i);
  assert.match(faqCopy, /does not automatically place orders/i);
});

test("phase 5Z agency page exposes the bulk authority section and FAQ schema input", () => {
  const source = readFileSync(new URL("../../app/for-agencies/page.tsx", import.meta.url), "utf8");
  const component = readFileSync(new URL("../../components/marketing/audiences/BulkSmmIndiaAuthority.tsx", import.meta.url), "utf8");
  assert.match(source, /BulkSmmIndiaAuthority/);
  assert.match(source, /bulkSmmFaqs/);
  assert.match(source, /bulkSmmIndiaKeywords/);
  assert.match(component, /Bulk SMM orders India/);
  assert.match(component, /not a promise of a white-label child panel/i);
  assert.match(component, /Open bulk planner/);
});


test("phase 13 implements only distinct Instagram content gaps", () => {
  assert.equal(hasUniqueInstagramGapTargets(), true);
  assert.deepEqual(implementedInstagramContentGapTargets, ["/blog/instagram-views-vs-reach"]);

  const implemented = instagramContentGapCandidates.filter((candidate) => candidate.decision === "implement");
  assert.equal(implemented.length, 1);
  assert.equal(implemented[0]?.cannibalizationRisk, "low");
  assert.ok((implemented[0]?.uniqueInformationValue ?? 0) >= 4);
  assert.ok((implemented[0]?.internalLinkValue ?? 0) >= 4);
});

test("phase 13 does not duplicate already-covered Instagram intents", () => {
  for (const id of [
    "followers-price-india",
    "organic-followers-india",
    "followers-vs-engagement",
    "follower-drops",
  ]) {
    assert.equal(
      instagramContentGapCandidates.find((candidate) => candidate.id === id)?.decision,
      "covered",
    );
  }

  assert.equal(
    instagramContentGapCandidates.find((candidate) => candidate.id === "likes-vs-views")?.decision,
    "defer",
  );
  assert.equal(
    instagramContentGapCandidates.find((candidate) => candidate.id === "profile-optimization")?.decision,
    "defer",
  );
});

test("phase 13 Instagram gap target is published and linked from the authority cluster", () => {
  assert.ok(articleSlugs.includes("instagram-views-vs-reach"));
  assert.ok(
    contentClusters.instagram.guideLinks.some(
      (link) => link.href === "/blog/instagram-views-vs-reach",
    ),
  );

  for (const target of implementedInstagramContentGapTargets) {
    assert.ok(
      articleSlugs.includes(target.replace("/blog/", "")),
      `${target} must resolve to a published blog article`,
    );
  }
});


test("phase 14 LinkedIn content gap keeps one distinct implemented target", () => {
  assert.equal(hasUniqueLinkedInGapTargets(), true);
  assert.deepEqual(implementedLinkedInContentGapTargets, ["/blog/linkedin-followers-vs-connections"]);

  for (const id of ["followers-price-india", "followers-vs-engagement", "personal-brand-growth"]) {
    assert.equal(
      linkedInContentGapCandidates.find((candidate) => candidate.id === id)?.decision,
      "covered",
    );
  }

  assert.equal(
    linkedInContentGapCandidates.find((candidate) => candidate.id === "profile-vs-company-page-followers")?.decision,
    "defer",
  );
  assert.equal(
    linkedInContentGapCandidates.find((candidate) => candidate.id === "linkedin-follow-button-strategy")?.decision,
    "defer",
  );
});

test("phase 14 LinkedIn gap target is published and linked from the authority cluster", () => {
  assert.ok(articleSlugs.includes("linkedin-followers-vs-connections"));
  assert.ok(
    contentClusters.linkedin.guideLinks.some(
      (link) => link.href === "/blog/linkedin-followers-vs-connections",
    ),
  );

  for (const target of implementedLinkedInContentGapTargets) {
    assert.ok(
      articleSlugs.includes(target.replace("/blog/", "")),
      `${target} must resolve to a published blog article`,
    );
  }
});

test("phase 14 LinkedIn guide strengthens existing canonicals without creating a transaction route", () => {
  const guide = linkedInContentGapCandidates.find((candidate) => candidate.id === "followers-vs-connections");
  assert.ok(guide);
  assert.equal(guide.intent, "informational");
  assert.equal(guide.cannibalizationRisk, "low");
  assert.equal(guide.primaryTarget.startsWith("/blog/"), true);

  const source = readFileSync(
    new URL("../../components/marketing/blog/linkedinContentGapGuides.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /LinkedIn followers in India/);
  assert.match(source, /\/linkedin-followers/);
  assert.match(source, /\/linkedin-growth-india/);
  assert.match(source, /does not prove engagement|does not guarantee|do not assume/i);
});
