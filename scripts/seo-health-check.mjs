#!/usr/bin/env node

const DEFAULT_BASE_URL = "https://www.getsocialrush.com";
const REQUEST_TIMEOUT_MS = 30_000;
const CONCURRENCY = 4;
const PHASE5_LASTMOD = "2026-09-27";
const PHASE5_SOCIAL_GROWTH_LASTMOD = "2026-09-28";
const PHASE5_SOCIAL_SERVICES_LASTMOD = "2026-10-01";
const PHASE5_PLATFORM_SMM_LASTMOD = "2026-09-28";
const PHASE5_PRICING_INTENT_LASTMOD = "2026-09-28";
const PHASE5_SAFE_ORDERING_LASTMOD = "2026-09-28";
const INDEXNOW_KEY = "8f7d2c91a4e64b7f9c3d1a6e5b8f2047";
const INDEXNOW_KEY_PATH = `/${INDEXNOW_KEY}.txt`;

const canonicalServicePaths = [
  "/buy-instagram-followers-india",
  "/instagram-likes",
  "/instagram-views",
  "/buy-instagram-comments-india",
  "/buy-instagram-saves-india",
  "/buy-instagram-shares-india",
  "/youtube-subscribers",
  "/youtube-likes",
  "/youtube-views",
  "/buy-youtube-comments-india",
  "/linkedin-followers",
  "/linkedin-likes",
  "/twitter-followers",
  "/buy-facebook-followers-india",
  "/buy-facebook-group-members-india",
  "/facebook-likes",
  "/facebook-views",
  "/buy-facebook-shares-india",
  "/telegram-members",
  "/tiktok-followers",
];

const priorityCommercialPaths = [
  "/",
  "/services",
  "/social-media-growth-india",
  "/for-agencies",
  "/pricing",
  "/packages",
  "/trust",
  "/instagram-growth-india",
  "/youtube-growth-india",
  "/facebook-growth-india",
  "/linkedin-growth-india",
  "/x-growth-india",
  "/tiktok-growth-india",
  "/services/telegram",
];

const priorityIndexablePaths = [
  ...priorityCommercialPaths,
  ...canonicalServicePaths,
];

const requiredSitemapPaths = [
  ...priorityIndexablePaths,
  "/tools/social-media-growth-audit",
  "/tools/social-media-growth-planner",
];

const phase5FreshnessExpected = new Map([
  ["/", PHASE5_LASTMOD],
  ["/services", PHASE5_SOCIAL_SERVICES_LASTMOD],
  ["/pricing", PHASE5_PRICING_INTENT_LASTMOD],
  ["/trust", PHASE5_SAFE_ORDERING_LASTMOD],
  ["/tools/social-media-service-cost-calculator", PHASE5_LASTMOD],
  ...canonicalServicePaths
    .filter((path) => path !== "/buy-facebook-shares-india")
    .map((path) => [path, PHASE5_LASTMOD]),
  ["/social-media-growth-india", PHASE5_SOCIAL_GROWTH_LASTMOD],
  ...["/instagram-growth-india","/youtube-growth-india","/facebook-growth-india","/linkedin-growth-india","/x-growth-india","/tiktok-growth-india","/services/telegram"].map((path) => [path, PHASE5_PLATFORM_SMM_LASTMOD]),
]);

const privateRobotsPaths = [
  "/dashboard",
  "/admin",
  "/api/",
  "/login",
  "/register",
  "/order-summary",
  "/packages/checkout",
];

const legacyRedirects = [
  ["/buy-instagram-followers", "/buy-instagram-followers-india"],
  ["/instagram-followers", "/buy-instagram-followers-india"],
  ["/services/instagram-audience-growth", "/buy-instagram-followers-india"],
  ["/services/instagram-followers", "/buy-instagram-followers-india"],
  ["/buy-instagram-likes-india", "/instagram-likes"],
  ["/services/instagram-engagement-boost", "/instagram-likes"],
  ["/services/instagram-likes", "/instagram-likes"],
  ["/buy-instagram-views-india", "/instagram-views"],
  ["/services/instagram-content-reach", "/instagram-views"],
  ["/services/instagram-views", "/instagram-views"],
  ["/buy-youtube-subscribers-india", "/youtube-subscribers"],
  ["/services/youtube-channel-growth", "/youtube-subscribers"],
  ["/services/youtube-subscribers", "/youtube-subscribers"],
  ["/buy-youtube-likes-india", "/youtube-likes"],
  ["/services/youtube-likes", "/youtube-likes"],
  ["/buy-youtube-views-india", "/youtube-views"],
  ["/services/youtube-video-promotion", "/youtube-views"],
  ["/services/youtube-views", "/youtube-views"],
  ["/youtube-watch-hours", "/buy-youtube-watch-hours-india"],
  ["/buy-linkedin-followers-india", "/linkedin-followers"],
  ["/services/linkedin-followers", "/linkedin-followers"],
  ["/services/linkedin-professional-growth", "/linkedin-followers"],
  ["/buy-linkedin-likes-india", "/linkedin-likes"],
  ["/services/linkedin-likes", "/linkedin-likes"],
  ["/buy-twitter-followers-india", "/twitter-followers"],
  ["/x-followers", "/twitter-followers"],
  ["/buy-x-followers", "/twitter-followers"],
  ["/buy-x-followers-india", "/twitter-followers"],
  ["/services/x-authority-growth", "/twitter-followers"],
  ["/services/x-followers", "/twitter-followers"],
  ["/facebook-followers", "/buy-facebook-followers-india"],
  ["/services/facebook-brand-engagement", "/buy-facebook-followers-india"],
  ["/services/facebook-followers", "/buy-facebook-followers-india"],
  ["/buy-facebook-likes-india", "/facebook-likes"],
  ["/services/facebook-likes", "/facebook-likes"],
  ["/buy-facebook-views-india", "/facebook-views"],
  ["/services/facebook-views", "/facebook-views"],
  ["/services/facebook-shares", "/buy-facebook-shares-india"],
  ["/buy-telegram-members-india", "/telegram-members"],
  ["/services/telegram-members", "/telegram-members"],
  ["/buy-tiktok-followers-india", "/tiktok-followers"],
  ["/services/tiktok-followers", "/tiktok-followers"],
  ["/services/smm-panel-india", "/services"],
  ["/smm-panel-india", "/services"],
  ["/social-media-services-india", "/services"],
  ["/best-smm-panel-india", "/services"],
  ["/reliable-smm-panel-india", "/services"],
  ["/trusted-smm-panel-india", "/services"],
  ["/fast-social-media-services-india", "/services"],
  ["/fast-social-media-growth-services-india", "/services"],
  ["/social-media-service-delivery-time-india", "/services"],
  ["/smm-reseller-panel-india", "/for-agencies"],
  ["/smm-panel-api-india", "/for-agencies"],
  ["/smm-reseller-api-india", "/for-agencies"],
  ["/smm-api-india", "/for-agencies"],
  ["/instagram-smm-panel-india", "/instagram-growth-india"],
  ["/smm-panel-for-instagram-india", "/instagram-growth-india"],
  ["/youtube-smm-panel-india", "/youtube-growth-india"],
  ["/smm-panel-for-youtube-india", "/youtube-growth-india"],
  ["/linkedin-smm-panel-india", "/linkedin-growth-india"],
  ["/smm-panel-for-linkedin-india", "/linkedin-growth-india"],
  ["/facebook-smm-panel-india", "/facebook-growth-india"],
  ["/smm-panel-for-facebook-india", "/facebook-growth-india"],
  ["/twitter-smm-panel-india", "/x-growth-india"],
  ["/x-smm-panel-india", "/x-growth-india"],
  ["/tiktok-smm-panel-india", "/tiktok-growth-india"],
  ["/smm-panel-for-tiktok-india", "/tiktok-growth-india"],
  ["/telegram-smm-panel-india", "/services/telegram"],
  ["/smm-panel-for-telegram-india", "/services/telegram"],
  ["/smm-panel-price-list-india", "/pricing"],
  ["/smm-panel-pricing-india", "/pricing"],
  ["/smm-panel-rates-india", "/pricing"],
  ["/upi-smm-panel-india", "/pricing"],
  ["/smm-panel-with-upi-india", "/pricing"],
  ["/cheap-smm-panel-india", "/pricing"],
  ["/affordable-smm-panel-india", "/pricing"],
  ["/low-cost-smm-panel-india", "/pricing"],
  ["/budget-smm-panel-india", "/pricing"],
  ["/smm-panel-for-agencies-india", "/for-agencies"],
  ["/safe-smm-panel-india", "/trust"],
  ["/smm-panel-without-password-india", "/trust"],
  ["/no-password-smm-panel-india", "/trust"],
  ["/public-link-smm-panel-india", "/trust"],
  ["/social-media-growth-services-india", "/social-media-growth-india"],
  ["/social-media-growth-service-india", "/social-media-growth-india"],
  ["/social-media-engagement-services-india", "/social-media-growth-india"],
  ["/social-media-engagement-service-india", "/social-media-growth-india"],
  ["/social-media-promotion-services-india", "/social-media-growth-india"],
  ["/social-media-promotion-service-india", "/social-media-growth-india"],
  [
    "/blog/linkedin-growth-tips-for-personal-brands",
    "/blog/linkedin-growth-tips-personal-brands",
  ],
];

const baseUrl = new URL(process.env.SEO_BASE_URL || DEFAULT_BASE_URL);
const failures = [];
let checks = 0;

function pass(label) {
  checks += 1;
  console.log(`PASS  ${label}`);
}

function fail(label, detail) {
  checks += 1;
  failures.push(`${label}: ${detail}`);
  console.error(`FAIL  ${label} — ${detail}`);
}

async function fetchWithTimeout(path, redirect = "follow") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(new URL(path, baseUrl), {
      redirect,
      signal: controller.signal,
      headers: {
        "user-agent": "SocialRUSH-SEO-Health-Monitor/1.1",
        accept: "text/html,application/xml,text/plain;q=0.9,*/*;q=0.8",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

function canonicalHref(html) {
  const tag = html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i)?.[0]
    ?? html.match(/<link\b[^>]*\bhref=["'][^"']+["'][^>]*\brel=["']canonical["'][^>]*>/i)?.[0];

  return tag?.match(/\bhref=["']([^"']+)["']/i)?.[1];
}

function metaDescription(html) {
  const tag = html.match(/<meta\b[^>]*\bname=["']description["'][^>]*>/i)?.[0]
    ?? html.match(/<meta\b[^>]*\bcontent=["'][^"']+["'][^>]*\bname=["']description["'][^>]*>/i)?.[0];

  return tag?.match(/\bcontent=["']([^"']+)["']/i)?.[1]?.trim();
}

function pageTitle(html) {
  return html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
}

async function checkPage(path) {
  const label = `page ${path}`;

  try {
    const response = await fetchWithTimeout(path);
    if (response.status !== 200) {
      fail(label, `expected HTTP 200, received ${response.status}`);
      return;
    }

    const html = await response.text();
    const robotsHeader = response.headers.get("x-robots-tag") ?? "";
    const hasNoindex = /noindex/i.test(robotsHeader)
      || /<meta\b[^>]*\bname=["']robots["'][^>]*\bcontent=["'][^"']*noindex/i.test(html)
      || /<meta\b[^>]*\bcontent=["'][^"']*noindex[^"']*["'][^>]*\bname=["']robots["']/i.test(html);
    if (hasNoindex) {
      fail(label, "page is marked noindex");
      return;
    }

    const title = pageTitle(html);
    if (!title) {
      fail(label, "title tag is missing");
      return;
    }

    const description = metaDescription(html);
    if (!description) {
      fail(label, "meta description is missing");
      return;
    }

    const actualCanonical = canonicalHref(html);
    const expectedCanonical = new URL(path, baseUrl).toString();
    if (!actualCanonical) {
      fail(label, "canonical link is missing");
      return;
    }
    if (new URL(actualCanonical, baseUrl).toString() !== expectedCanonical) {
      fail(label, `canonical is ${actualCanonical}; expected ${expectedCanonical}`);
      return;
    }

    pass(label);
  } catch (error) {
    fail(label, error instanceof Error ? error.message : String(error));
  }
}

async function checkRobotsAndSitemap() {
  try {
    const robotsResponse = await fetchWithTimeout("/robots.txt");
    const robots = await robotsResponse.text();
    if (robotsResponse.status !== 200) {
      fail("robots.txt", `expected HTTP 200, received ${robotsResponse.status}`);
    } else if (!/Sitemap:\s*https:\/\/www\.getsocialrush\.com\/sitemap\.xml/i.test(robots)) {
      fail("robots.txt", "canonical sitemap declaration missing");
    } else {
      const missingPrivateRules = privateRobotsPaths.filter(
        (path) => !robots.includes(`Disallow: ${path}`),
      );
      if (missingPrivateRules.length > 0) {
        fail("robots.txt", `missing private-route rules for ${missingPrivateRules.join(", ")}`);
      } else {
        pass("robots.txt advertises the canonical sitemap and protects private routes");
      }
    }
  } catch (error) {
    fail("robots.txt", error instanceof Error ? error.message : String(error));
  }

  try {
    const sitemapResponse = await fetchWithTimeout("/sitemap.xml");
    const sitemap = await sitemapResponse.text();
    if (sitemapResponse.status !== 200 || !/<urlset\b/i.test(sitemap)) {
      fail("sitemap.xml", `expected a valid urlset with HTTP 200; received ${sitemapResponse.status}`);
      return;
    }

    const missing = requiredSitemapPaths.filter(
      (path) => !sitemap.includes(`<loc>${new URL(path, baseUrl).toString()}</loc>`),
    );
    if (missing.length > 0) {
      fail("sitemap.xml", `missing ${missing.join(", ")}`);
      return;
    }
    const stale = [...phase5FreshnessExpected.entries()].filter(([path, expectedLastmod]) => {
      const loc = `<loc>${new URL(path, baseUrl).toString()}</loc>`;
      const entryStart = sitemap.indexOf(loc);
      if (entryStart < 0) return true;
      const entryEnd = sitemap.indexOf("</url>", entryStart);
      if (entryEnd < 0) return true;
      return !sitemap.slice(entryStart, entryEnd).includes(`<lastmod>${expectedLastmod}</lastmod>`);
    }).map(([path]) => path);
    if (stale.length > 0) {
      fail("sitemap.xml", `missing Phase 5 lastmod for ${stale.join(", ")}`);
      return;
    }
    pass(`sitemap.xml contains ${requiredSitemapPaths.length} priority URLs and truthful Phase 5 lastmod signals`);
  } catch (error) {
    fail("sitemap.xml", error instanceof Error ? error.message : String(error));
  }
}

async function checkIndexNowKey() {
  try {
    const response = await fetchWithTimeout(INDEXNOW_KEY_PATH);
    const body = (await response.text()).trim();
    if (response.status !== 200 || body !== INDEXNOW_KEY) {
      fail("IndexNow key", `expected public key file at ${INDEXNOW_KEY_PATH}`);
      return;
    }
    pass("IndexNow ownership key is publicly verifiable");
  } catch (error) {
    fail("IndexNow key", error instanceof Error ? error.message : String(error));
  }
}

async function checkRedirect([source, destination]) {
  const label = `redirect ${source}`;
  try {
    const response = await fetchWithTimeout(source, "manual");
    const location = response.headers.get("location");
    const actualDestination = location ? new URL(location, baseUrl).pathname : "";
    if (![301, 308].includes(response.status)) {
      fail(label, `expected 301/308, received ${response.status}`);
    } else if (actualDestination !== destination) {
      fail(label, `points to ${actualDestination || "no location"}; expected ${destination}`);
    } else {
      pass(label);
    }
  } catch (error) {
    fail(label, error instanceof Error ? error.message : String(error));
  }
}

async function runInBatches(items, task) {
  for (let index = 0; index < items.length; index += CONCURRENCY) {
    await Promise.all(items.slice(index, index + CONCURRENCY).map(task));
  }
}

console.log(`SocialRUSH SEO health check: ${baseUrl.origin}`);
await checkRobotsAndSitemap();
await checkIndexNowKey();
await runInBatches(priorityIndexablePaths, checkPage);
await runInBatches(legacyRedirects, checkRedirect);

console.log(`\n${checks - failures.length}/${checks} checks passed.`);
if (failures.length > 0) {
  console.error("\nSEO health check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
}
