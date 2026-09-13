#!/usr/bin/env node

const DEFAULT_BASE_URL = "https://www.getsocialrush.com";
const REQUEST_TIMEOUT_MS = 30_000;
const CONCURRENCY = 4;

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
  "/pricing",
  "/packages",
  "/instagram-growth-india",
  "/youtube-growth-india",
  "/facebook-growth-india",
  "/linkedin-growth-india",
  "/x-growth-india",
  "/tiktok-growth-india",
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
  ["/instagram-followers", "/buy-instagram-followers-india"],
  ["/buy-youtube-subscribers-india", "/youtube-subscribers"],
  ["/buy-linkedin-followers-india", "/linkedin-followers"],
  ["/services/facebook-shares", "/buy-facebook-shares-india"],
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
    pass(`sitemap.xml contains ${requiredSitemapPaths.length} priority URLs`);
  } catch (error) {
    fail("sitemap.xml", error instanceof Error ? error.message : String(error));
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
await runInBatches(priorityIndexablePaths, checkPage);
await runInBatches(legacyRedirects, checkRedirect);

console.log(`\n${checks - failures.length}/${checks} checks passed.`);
if (failures.length > 0) {
  console.error("\nSEO health check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
}
