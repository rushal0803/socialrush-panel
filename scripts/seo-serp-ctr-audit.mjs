#!/usr/bin/env node

const BASE_URL = process.env.SEO_BASE_URL || "https://www.getsocialrush.com";
const TIMEOUT_MS = 20_000;
const CONCURRENCY = 6;
const warnings = [];
const failures = [];

async function fetchText(url, redirect = "follow") {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      redirect,
      signal: controller.signal,
      headers: {
        "user-agent": "SocialRUSH-Phase28-SERP-CTR-Audit/1.0",
        accept: "text/html,application/xml,text/plain;q=0.9,*/*;q=0.8",
      },
    });
    return { response, text: await response.text() };
  } finally {
    clearTimeout(timer);
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
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => decodeXml(match[1].trim())).filter(Boolean);
}

function extractTitle(html) {
  return html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() || null;
}

function extractDescription(html) {
  const tag =
    html.match(/<meta\b[^>]*\bname=["']description["'][^>]*>/i)?.[0] ??
    html.match(/<meta\b[^>]*\bcontent=["'][^"']*["'][^>]*\bname=["']description["'][^>]*>/i)?.[0] ??
    null;
  return tag?.match(/\bcontent=["']([^"']*)["']/i)?.[1]?.trim() || null;
}

async function inspect(url) {
  try {
    const { response, text } = await fetchText(url);
    const path = new URL(url).pathname;
    if (response.status !== 200) {
      failures.push(`${path}: expected HTTP 200, received ${response.status}`);
      return null;
    }

    const title = extractTitle(text);
    const description = extractDescription(text);
    if (!title) failures.push(`${path}: title is missing`);
    if (!description) failures.push(`${path}: meta description is missing`);

    if (title && (title.length < 28 || title.length > 65)) {
      warnings.push(`${path}: title length ${title.length} is outside the Phase 28 editorial review range (28–65 characters)`);
    }
    if (description && (description.length < 90 || description.length > 175)) {
      warnings.push(`${path}: description length ${description.length} is outside the Phase 28 editorial review range (90–175 characters)`);
    }

    return { url, path, title, description };
  } catch (error) {
    failures.push(`${url}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

async function batched(items, task) {
  const results = [];
  for (let index = 0; index < items.length; index += CONCURRENCY) {
    results.push(...await Promise.all(items.slice(index, index + CONCURRENCY).map(task)));
  }
  return results;
}

console.log(`SocialRUSH Phase 28 SERP snippet audit: ${BASE_URL}`);

const sitemap = await fetchText(new URL("/sitemap.xml", BASE_URL).toString());
if (!sitemap.response.ok) {
  console.error(`FAIL sitemap.xml returned ${sitemap.response.status}`);
  process.exit(1);
}

const urls = [...new Set(sitemapUrls(sitemap.text))];
const rows = (await batched(urls, inspect)).filter(Boolean);

const titleMap = new Map();
const descriptionMap = new Map();
for (const row of rows) {
  if (row.title) titleMap.set(row.title, [...(titleMap.get(row.title) ?? []), row.path]);
  if (row.description) descriptionMap.set(row.description, [...(descriptionMap.get(row.description) ?? []), row.path]);
}

for (const [title, paths] of titleMap.entries()) {
  if (paths.length > 1) failures.push(`duplicate title across ${paths.join(", ")}: ${title}`);
}
for (const [description, paths] of descriptionMap.entries()) {
  if (paths.length > 1) warnings.push(`duplicate description across ${paths.join(", ")}: ${description.slice(0, 120)}`);
}

console.log(`Checked ${rows.length} sitemap pages. ${warnings.length} warning(s), ${failures.length} failure(s).`);
if (warnings.length) {
  console.warn("\nEditorial CTR warnings:");
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}
if (failures.length) {
  console.error("\nSERP CTR audit failures:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
}
