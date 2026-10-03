#!/usr/bin/env node

const DEFAULT_BASE_URL = "https://www.getsocialrush.com";
const REQUEST_TIMEOUT_MS = 20_000;
const CONCURRENCY = 6;

const baseUrl = new URL(process.env.SEO_BASE_URL || DEFAULT_BASE_URL);
const failures = [];
const warnings = [];
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

function warn(label, detail) {
  warnings.push(`${label}: ${detail}`);
  console.warn(`WARN  ${label} — ${detail}`);
}

async function fetchWithTimeout(url, redirect = "manual") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      redirect,
      signal: controller.signal,
      headers: {
        "user-agent": "SocialRUSH-Phase25-Technical-SEO/1.0",
        accept: "text/html,application/xml,text/plain;q=0.9,*/*;q=0.8",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function sitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
    .map((match) => decodeXml(match[1].trim()))
    .filter(Boolean);
}

function canonicalHref(html) {
  const tag =
    html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i)?.[0] ??
    html.match(/<link\b[^>]*\bhref=["'][^"']+["'][^>]*\brel=["']canonical["'][^>]*>/i)?.[0];
  return tag?.match(/\bhref=["']([^"']+)["']/i)?.[1] ?? null;
}

function metaDescription(html) {
  const tag =
    html.match(/<meta\b[^>]*\bname=["']description["'][^>]*>/i)?.[0] ??
    html.match(/<meta\b[^>]*\bcontent=["'][^"']+["'][^>]*\bname=["']description["'][^>]*>/i)?.[0];
  return tag?.match(/\bcontent=["']([^"']+)["']/i)?.[1]?.trim() ?? null;
}

function pageTitle(html) {
  return html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ?? null;
}

function normalize(url) {
  const value = new URL(url, baseUrl);
  value.hash = "";
  value.search = "";
  if (value.pathname !== "/") value.pathname = value.pathname.replace(/\/$/, "");
  return value.toString();
}

function hasNoindex(response, html) {
  const header = response.headers.get("x-robots-tag") ?? "";
  return /noindex/i.test(header)
    || /<meta\b[^>]*\bname=["']robots["'][^>]*\bcontent=["'][^"']*noindex/i.test(html)
    || /<meta\b[^>]*\bcontent=["'][^"']*noindex[^"']*["'][^>]*\bname=["']robots["']/i.test(html);
}

function validateJsonLd(html, url) {
  const blocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const [index, block] of blocks.entries()) {
    const raw = block[1].trim();
    if (!raw) continue;
    try {
      JSON.parse(raw);
    } catch (error) {
      fail(`JSON-LD ${url} #${index + 1}`, error instanceof Error ? error.message : String(error));
      return false;
    }
  }
  return true;
}

async function inspectPage(url, titleOwners, descriptionOwners) {
  const label = new URL(url).pathname || "/";
  try {
    const response = await fetchWithTimeout(url, "manual");
    if (response.status !== 200) {
      const location = response.headers.get("location");
      fail(label, `sitemap URL must return 200 directly; received ${response.status}${location ? ` -> ${location}` : ""}`);
      return;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      fail(label, `expected text/html; received ${contentType || "unknown content type"}`);
      return;
    }

    const html = await response.text();
    if (hasNoindex(response, html)) {
      fail(label, "sitemap URL is marked noindex");
      return;
    }

    const canonical = canonicalHref(html);
    if (!canonical) {
      fail(label, "canonical link is missing");
      return;
    }
    if (normalize(canonical) !== normalize(url)) {
      fail(label, `canonical mismatch: ${canonical}`);
      return;
    }
    if (!canonical.startsWith("https://www.getsocialrush.com/") && canonical !== "https://www.getsocialrush.com") {
      fail(label, `canonical is not on the HTTPS www host: ${canonical}`);
      return;
    }

    const title = pageTitle(html);
    const description = metaDescription(html);
    if (!title) {
      fail(label, "title is missing");
      return;
    }
    if (!description) {
      fail(label, "meta description is missing");
      return;
    }

    const priorTitle = titleOwners.get(title);
    if (priorTitle && priorTitle !== url) warn("duplicate title", `${label} matches ${new URL(priorTitle).pathname}: ${title}`);
    else titleOwners.set(title, url);

    const priorDescription = descriptionOwners.get(description);
    if (priorDescription && priorDescription !== url) warn("duplicate description", `${label} matches ${new URL(priorDescription).pathname}`);
    else descriptionOwners.set(description, url);

    if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(html)) {
      fail(label, "html lang attribute is missing");
      return;
    }

    if (!validateJsonLd(html, url)) return;
    pass(label);
  } catch (error) {
    fail(label, error instanceof Error ? error.message : String(error));
  }
}

async function runInBatches(items, task) {
  for (let index = 0; index < items.length; index += CONCURRENCY) {
    await Promise.all(items.slice(index, index + CONCURRENCY).map(task));
  }
}

console.log(`SocialRUSH Phase 25 sitewide technical SEO audit: ${baseUrl.origin}`);

let sitemapResponse;
try {
  sitemapResponse = await fetchWithTimeout(new URL("/sitemap.xml", baseUrl), "follow");
} catch (error) {
  fail("sitemap.xml", error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

if (sitemapResponse) {
  const xml = await sitemapResponse.text();
  if (sitemapResponse.status !== 200 || !/<urlset\b/i.test(xml)) {
    fail("sitemap.xml", `invalid sitemap response: HTTP ${sitemapResponse.status}`);
  } else {
    const urls = sitemapUrls(xml);
    const uniqueUrls = [...new Set(urls)];
    if (uniqueUrls.length !== urls.length) fail("sitemap.xml", "contains duplicate <loc> entries");
    else pass(`sitemap.xml has ${urls.length} unique URLs`);

    const invalid = uniqueUrls.filter((value) => {
      const url = new URL(value);
      return url.origin !== baseUrl.origin || url.search || url.hash || (url.protocol !== "https:");
    });
    if (invalid.length) fail("sitemap.xml", `contains non-canonical URLs: ${invalid.slice(0, 10).join(", ")}`);
    else pass("sitemap.xml URLs use the canonical HTTPS host without query strings or fragments");

    const titleOwners = new Map();
    const descriptionOwners = new Map();
    await runInBatches(uniqueUrls, (url) => inspectPage(url, titleOwners, descriptionOwners));
  }
}

console.log(`\n${checks - failures.length}/${checks} checks passed; ${warnings.length} warning(s).`);
if (warnings.length) {
  console.warn("\nTechnical SEO warnings:");
  warnings.forEach((item) => console.warn(`- ${item}`));
}
if (failures.length) {
  console.error("\nTechnical SEO audit failed:");
  failures.forEach((item) => console.error(`- ${item}`));
  process.exitCode = 1;
}
