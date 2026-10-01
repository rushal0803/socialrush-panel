#!/usr/bin/env node

const BASE_URL = new URL(process.env.SEO_BASE_URL || "https://www.getsocialrush.com");
const REQUEST_TIMEOUT_MS = 30000;
const CONCURRENCY = 4;

const pages = [
  { path: "/instagram-growth-india", marker: "Instagram", schemaTypes: [] },
  { path: "/buy-instagram-followers-india", marker: "Instagram Followers", schemaTypes: ["Service", "BreadcrumbList", "FAQPage"] },
  { path: "/instagram-likes", marker: "Instagram Likes", schemaTypes: ["Service"] },
  { path: "/instagram-views", marker: "Instagram Views", schemaTypes: ["Service"] },
  { path: "/buy-instagram-comments-india", marker: "Instagram Comments", schemaTypes: ["Service"] },
  { path: "/buy-instagram-saves-india", marker: "Instagram Saves", schemaTypes: ["Service"] },
  { path: "/buy-instagram-shares-india", marker: "Instagram Shares", schemaTypes: ["Service"] },
  { path: "/blog/how-to-grow-instagram-followers-organically-india", marker: "Instagram", schemaTypes: ["BlogPosting", "BreadcrumbList"] },
  { path: "/blog/instagram-followers-price-in-india", marker: "Instagram Followers Price", schemaTypes: ["BlogPosting", "BreadcrumbList"] },
  { path: "/blog/is-it-safe-to-buy-instagram-followers", marker: "Instagram Followers", schemaTypes: ["BlogPosting", "BreadcrumbList"] },
  { path: "/blog/instagram-followers-vs-engagement", marker: "Instagram Followers", schemaTypes: ["BlogPosting", "BreadcrumbList"] },
  { path: "/blog/why-instagram-followers-drop", marker: "Instagram Followers", schemaTypes: ["BlogPosting", "BreadcrumbList"] },
  { path: "/blog/instagram-followers-vs-likes-india", marker: "Instagram", schemaTypes: ["BlogPosting", "BreadcrumbList"] },
  { path: "/tools/instagram-engagement-rate-calculator", marker: "Instagram", schemaTypes: [] },
  { path: "/tools/instagram-follower-growth-rate-calculator", marker: "Instagram", schemaTypes: [] },
  { path: "/tools/instagram-reach-rate-calculator", marker: "Instagram", schemaTypes: [] },
  { path: "/tools/instagram-story-engagement-rate-calculator", marker: "Instagram", schemaTypes: [] },
  { path: "/tools/instagram-caption-counter", marker: "Instagram", schemaTypes: [] },
];

const aliases = [
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

async function fetchUrl(url, redirect = "follow") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      redirect,
      signal: controller.signal,
      headers: {
        "user-agent": "SocialRUSH-Phase16-Instagram-Technical-SEO/1.0",
        accept: "text/html,application/xml,text/plain;q=0.9,*/*;q=0.8",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

function absolute(path) {
  return new URL(path, BASE_URL);
}

function canonicalHref(html) {
  const tag =
    html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i)?.[0] ??
    html.match(/<link\b[^>]*\bhref=["'][^"']+["'][^>]*\brel=["']canonical["'][^>]*>/i)?.[0];
  return tag?.match(/\bhref=["']([^"']+)["']/i)?.[1] ?? "";
}

function titleText(html) {
  return html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ?? "";
}

function h1Text(html) {
  const match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  return match?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "";
}

function hasNoindex(response, html) {
  const header = response.headers.get("x-robots-tag") ?? "";
  return /noindex/i.test(header) ||
    /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html) ||
    /<meta\b[^>]*content=["'][^"']*noindex[^"']*["'][^>]*name=["']robots["']/i.test(html);
}

function structuredType(html, type) {
  const safe = type.replace(/[.*+?^$()|[\]\\]/g, "\\$&");
  return new RegExp('["\\']@type["\\']\\s*:\\s*["\\']' + safe + '["\\']', "i").test(html);
}

function internalLinks(html) {
  const links = new Set();
  for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"'#]+)["'][^>]*>/gi)) {
    const href = match[1]?.trim();
    if (!href || /^(mailto:|tel:|javascript:)/i.test(href)) continue;
    try {
      const url = new URL(href, BASE_URL);
      if (url.origin !== BASE_URL.origin) continue;
      if (/\.(?:png|jpe?g|webp|avif|svg|ico|pdf|xml|txt)$/i.test(url.pathname)) continue;
      links.add(url.pathname + url.search);
    } catch {}
  }
  return [...links];
}

async function inBatches(items, task) {
  for (let index = 0; index < items.length; index += CONCURRENCY) {
    await Promise.all(items.slice(index, index + CONCURRENCY).map(task));
  }
}

async function checkPage(page) {
  const label = "page " + page.path;
  try {
    const response = await fetchUrl(absolute(page.path));
    if (response.status !== 200) {
      fail(label, "expected HTTP 200, received " + response.status);
      return null;
    }
    if (!/text\/html/i.test(response.headers.get("content-type") ?? "")) {
      fail(label, "response is not HTML");
      return null;
    }

    const html = await response.text();
    if (html.length < 1200) {
      fail(label, "SSR HTML is unexpectedly thin at " + html.length + " bytes");
      return null;
    }
    if (hasNoindex(response, html)) {
      fail(label, "page is marked noindex");
      return null;
    }

    const title = titleText(html);
    const h1 = h1Text(html);
    if (!title || !h1) {
      fail(label, "server-rendered title or H1 is missing");
      return null;
    }
    if (/404|not found/i.test(title + " " + h1)) {
      fail(label, "soft-404 wording detected in title/H1");
      return null;
    }
    if (!html.toLowerCase().includes(page.marker.toLowerCase())) {
      fail(label, 'SSR HTML is missing expected marker "' + page.marker + '"');
      return null;
    }

    const expectedCanonical = absolute(page.path).toString();
    const canonical = canonicalHref(html);
    if (!canonical || new URL(canonical, BASE_URL).toString() !== expectedCanonical) {
      fail(label, "canonical is " + (canonical || "missing") + "; expected " + expectedCanonical);
      return null;
    }

    for (const type of page.schemaTypes) {
      if (!structuredType(html, type)) {
        fail(label, "structured data missing @type " + type);
        return null;
      }
    }

    const queryResponse = await fetchUrl(absolute(page.path + "?utm_source=phase16&utm_medium=technical-seo"));
    const queryHtml = await queryResponse.text();
    const queryCanonical = canonicalHref(queryHtml);
    if (queryResponse.status !== 200 || !queryCanonical || new URL(queryCanonical, BASE_URL).toString() !== expectedCanonical) {
      fail(label, "tracking-query variant does not consolidate to clean canonical");
      return null;
    }

    const slashResponse = await fetchUrl(absolute(page.path + "/"), "manual");
    const slashLocation = slashResponse.headers.get("location");
    if (![301, 308].includes(slashResponse.status) || !slashLocation || new URL(slashLocation, BASE_URL).pathname !== page.path) {
      fail(label, "trailing-slash variant is not permanently normalized");
      return null;
    }

    pass(label);
    return { path: page.path, html };
  } catch (error) {
    fail(label, error instanceof Error ? error.message : String(error));
    return null;
  }
}

async function checkAliases() {
  await inBatches(aliases, async ([source, target]) => {
    const label = "alias " + source;
    try {
      const response = await fetchUrl(absolute(source), "manual");
      const location = response.headers.get("location");
      if (![301, 308].includes(response.status) || !location || new URL(location, BASE_URL).pathname !== target) {
        fail(label, "expected permanent redirect to " + target + "; received " + response.status + " " + (location || ""));
      } else {
        pass(label);
      }
    } catch (error) {
      fail(label, error instanceof Error ? error.message : String(error));
    }
  });
}

async function checkSitemap() {
  try {
    const response = await fetchUrl(absolute("/sitemap.xml"));
    const xml = await response.text();
    if (response.status !== 200 || !/<urlset\b/i.test(xml)) {
      fail("sitemap", "invalid sitemap response " + response.status);
      return;
    }

    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    const missing = pages.map((page) => absolute(page.path).toString()).filter((url) => !locs.includes(url));
    const queryUrls = locs.filter((url) => url.includes("?"));
    const duplicates = [...new Set(locs.filter((url, index) => locs.indexOf(url) !== index))];
    const aliasUrls = aliases.map(([source]) => absolute(source).toString()).filter((url) => locs.includes(url));

    if (missing.length || queryUrls.length || duplicates.length || aliasUrls.length) {
      fail("sitemap", [
        missing.length ? "missing: " + missing.join(", ") : "",
        queryUrls.length ? "query URLs: " + queryUrls.join(", ") : "",
        duplicates.length ? "duplicates: " + duplicates.join(", ") : "",
        aliasUrls.length ? "Instagram aliases: " + aliasUrls.join(", ") : "",
      ].filter(Boolean).join("; "));
      return;
    }

    pass("sitemap contains all important Instagram canonicals without aliases/query duplicates");
  } catch (error) {
    fail("sitemap", error instanceof Error ? error.message : String(error));
  }
}

async function checkCanonicalHost() {
  const path = "/buy-instagram-followers-india";
  try {
    const response = await fetchUrl(new URL("https://getsocialrush.com" + path), "manual");
    const location = response.headers.get("location");
    const expected = "https://www.getsocialrush.com" + path;
    if (![301, 308].includes(response.status) || !location || new URL(location, expected).toString() !== expected) {
      fail("canonical host", "expected permanent redirect to " + expected + "; received " + response.status + " " + (location || ""));
    } else {
      pass("canonical host redirects non-www Instagram URL to www");
    }
  } catch (error) {
    fail("canonical host", error instanceof Error ? error.message : String(error));
  }
}

async function checkInternalLinks(results) {
  const links = [...new Set(results.filter(Boolean).flatMap((result) => internalLinks(result.html)))];
  const broken = [];
  await inBatches(links, async (href) => {
    try {
      const response = await fetchUrl(absolute(href), "manual");
      if (response.status >= 400) broken.push(href + " (" + response.status + ")");
    } catch (error) {
      broken.push(href + " (" + (error instanceof Error ? error.message : String(error)) + ")");
    }
  });

  if (broken.length) {
    fail("internal links", broken.slice(0, 25).join(", "));
  } else {
    pass("internal links resolve across " + links.length + " unique same-origin hrefs");
  }
}

console.log("Phase 16 Instagram technical SEO audit: " + BASE_URL.origin);
await checkCanonicalHost();
await checkSitemap();
await checkAliases();

const results = [];
await inBatches(pages, async (page) => {
  results.push(await checkPage(page));
});
await checkInternalLinks(results);

console.log("\n" + (checks - failures.length) + "/" + checks + " checks passed.");
if (failures.length) {
  console.error("\nPhase 16 technical SEO audit failed:");
  failures.forEach((item) => console.error("- " + item));
  process.exitCode = 1;
}
