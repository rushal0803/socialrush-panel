#!/usr/bin/env node

const BASE_URL = new URL(process.env.SEO_BASE_URL || "https://www.getsocialrush.com");
const REQUEST_TIMEOUT_MS = 30000;
const CONCURRENCY = 4;

const requiredInstagramPaths = [
  // Canonical India commercial + platform authority.
  "/instagram-growth-india",
  "/buy-instagram-followers-india",
  "/instagram-likes",
  "/instagram-views",
  "/buy-instagram-comments-india",
  "/buy-instagram-saves-india",
  "/buy-instagram-shares-india",

  // Useful Instagram tools.
  "/tools/instagram-engagement-rate-calculator",
  "/tools/instagram-follower-growth-rate-calculator",
  "/tools/instagram-reach-rate-calculator",
  "/tools/instagram-story-engagement-rate-calculator",
  "/tools/instagram-caption-counter",

  // Distinct Instagram editorial guides.
  "/blog/instagram-followers-upi-payment-guide-india",
  "/blog/best-time-to-post-on-instagram-india",
  "/blog/why-instagram-followers-drop",
  "/blog/how-to-grow-instagram-followers-organically-india",
  "/blog/how-to-grow-fast-on-instagram",
  "/blog/how-to-grow-instagram-followers-in-india",
  "/blog/instagram-followers-price-in-india",
  "/blog/is-it-safe-to-buy-instagram-followers",
  "/blog/how-to-increase-instagram-followers-safely-in-india",
  "/blog/instagram-followers-vs-engagement",
  "/blog/instagram-followers-vs-likes-india",
  "/blog/instagram-views-vs-reach",

  // Published country-specific Instagram follower pages.
  "/us/buy-instagram-followers",
  "/uk/buy-instagram-followers",
  "/ca/buy-instagram-followers",
  "/au/buy-instagram-followers",
  "/ae/buy-instagram-followers",
  "/sg/buy-instagram-followers",
];

const excludedInstagramPaths = [
  // Redirect aliases and legacy duplicates.
  "/buy-instagram-followers",
  "/instagram-followers",
  "/services/instagram-audience-growth",
  "/services/instagram-followers",
  "/buy-instagram-likes-india",
  "/services/instagram-engagement-boost",
  "/services/instagram-likes",
  "/buy-instagram-views-india",
  "/services/instagram-content-reach",
  "/services/instagram-views",
  "/instagram-smm-panel-india",
  "/smm-panel-for-instagram-india",

  // Non-canonical/error-style route that should never be submitted.
  "/services/instagram",
];

const forbiddenPrefixes = [
  "/dashboard",
  "/admin",
  "/api/",
  "/auth/",
  "/login",
  "/register",
  "/account",
  "/orders",
  "/wallet",
  "/billing",
  "/new-campaign",
  "/order-summary",
  "/packages/checkout",
  "/packages/summary",
];

const failures = [];
let checks = 0;

function pass(label) {
  checks += 1;
  console.log("PASS  " + label);
}

function fail(label, detail) {
  checks += 1;
  failures.push(label + ": " + detail);
  console.error("FAIL  " + label + " — " + detail);
}

function absolute(path) {
  return new URL(path, BASE_URL);
}

async function fetchUrl(url, redirect = "manual") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      redirect,
      signal: controller.signal,
      headers: {
        "user-agent": "SocialRUSH-Phase17-Instagram-Sitemap/1.0",
        accept: "text/html,application/xml,text/plain;q=0.9,*/*;q=0.8",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

function canonicalHref(html) {
  const tag =
    html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i)?.[0] ??
    html.match(/<link\b[^>]*\bhref=["'][^"']+["'][^>]*\brel=["']canonical["'][^>]*>/i)?.[0];
  return tag?.match(/\bhref=["']([^"']+)["']/i)?.[1] ?? "";
}

function hasNoindex(response, html) {
  const header = response.headers.get("x-robots-tag") ?? "";
  return /noindex/i.test(header) ||
    /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html) ||
    /<meta\b[^>]*content=["'][^"']*noindex[^"']*["'][^>]*name=["']robots["']/i.test(html);
}

function titleText(html) {
  return html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ?? "";
}

function h1Text(html) {
  const match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  return match?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "";
}

function metaDescription(html) {
  const tag =
    html.match(/<meta\b[^>]*\bname=["']description["'][^>]*>/i)?.[0] ??
    html.match(/<meta\b[^>]*\bcontent=["'][^"']+["'][^>]*\bname=["']description["'][^>]*>/i)?.[0];
  return tag?.match(/\bcontent=["']([^"']+)["']/i)?.[1]?.trim() ?? "";
}

async function inBatches(items, task) {
  for (let index = 0; index < items.length; index += CONCURRENCY) {
    await Promise.all(items.slice(index, index + CONCURRENCY).map(task));
  }
}

async function checkRequiredPage(path) {
  const label = "Instagram sitemap page " + path;
  try {
    const response = await fetchUrl(absolute(path), "manual");
    if (response.status !== 200) {
      fail(label, "expected direct HTTP 200, received " + response.status);
      return;
    }
    if (!/text\/html/i.test(response.headers.get("content-type") ?? "")) {
      fail(label, "expected HTML response");
      return;
    }

    const html = await response.text();
    if (html.length < 1200) {
      fail(label, "SSR HTML is too thin at " + html.length + " bytes");
      return;
    }
    if (hasNoindex(response, html)) {
      fail(label, "page is marked noindex");
      return;
    }

    const title = titleText(html);
    const h1 = h1Text(html);
    const description = metaDescription(html);
    if (!title || !h1 || !description) {
      fail(label, "title, H1 or meta description is missing");
      return;
    }
    if (/404|not found|page unavailable/i.test(title + " " + h1)) {
      fail(label, "soft-404 wording detected");
      return;
    }
    if (!/instagram/i.test(html)) {
      fail(label, "meaningful Instagram content marker is missing");
      return;
    }

    const canonical = canonicalHref(html);
    const expected = absolute(path).toString();
    if (!canonical || new URL(canonical, BASE_URL).toString() !== expected) {
      fail(label, "canonical is " + (canonical || "missing") + "; expected " + expected);
      return;
    }

    pass(label);
  } catch (error) {
    fail(label, error instanceof Error ? error.message : String(error));
  }
}

async function checkSitemap() {
  try {
    const response = await fetchUrl(absolute("/sitemap.xml"), "manual");
    const xml = await response.text();
    if (response.status !== 200 || !/<urlset\b/i.test(xml)) {
      fail("Instagram sitemap", "expected HTTP 200 XML urlset; received " + response.status);
      return;
    }

    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
    const locSet = new Set(locs);
    const requiredUrls = requiredInstagramPaths.map((path) => absolute(path).toString());
    const missing = requiredUrls.filter((url) => !locSet.has(url));
    const duplicates = [...new Set(locs.filter((url, index) => locs.indexOf(url) !== index))];
    const queryOrFragment = locs.filter((url) => /[?#]/.test(url));
    const wrongHost = locs.filter((url) => {
      try {
        return new URL(url).origin !== BASE_URL.origin;
      } catch {
        return true;
      }
    });
    const excluded = excludedInstagramPaths
      .map((path) => absolute(path).toString())
      .filter((url) => locSet.has(url));
    const privateUrls = locs.filter((url) => {
      try {
        const pathname = new URL(url).pathname;
        return forbiddenPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix.endsWith("/") ? prefix : prefix + "/"));
      } catch {
        return true;
      }
    });

    const issues = [
      missing.length ? "missing required Instagram URLs: " + missing.join(", ") : "",
      excluded.length ? "excluded aliases/error URLs present: " + excluded.join(", ") : "",
      duplicates.length ? "duplicate URLs: " + duplicates.join(", ") : "",
      queryOrFragment.length ? "query/hash URLs present: " + queryOrFragment.join(", ") : "",
      wrongHost.length ? "non-canonical host URLs present: " + wrongHost.join(", ") : "",
      privateUrls.length ? "private/internal URLs present: " + privateUrls.join(", ") : "",
    ].filter(Boolean);

    if (issues.length) {
      fail("Instagram sitemap", issues.join("; "));
      return;
    }

    pass("Instagram sitemap contains all " + requiredInstagramPaths.length + " required canonical URLs and excludes aliases/private/query URLs");
  } catch (error) {
    fail("Instagram sitemap", error instanceof Error ? error.message : String(error));
  }
}

console.log("Phase 17 Instagram sitemap audit: " + BASE_URL.origin);
await checkSitemap();
await inBatches(requiredInstagramPaths, checkRequiredPage);

console.log("\n" + (checks - failures.length) + "/" + checks + " checks passed.");
if (failures.length) {
  console.error("\nPhase 17 Instagram sitemap audit failed:");
  failures.forEach((item) => console.error("- " + item));
  process.exitCode = 1;
}
