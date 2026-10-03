import { SEO_SITE_URL } from "@/lib/seo/metadata";
import { crawlPriorityServiceLinks, searchPlanningLinks } from "@/lib/seo/search-priority";

export type IndexationTarget = Readonly<{
  path: string;
  label: string;
  group: "Core" | "Commercial" | "Planning";
}>;

export type IndexationCheck = IndexationTarget & {
  url: string;
  httpStatus: number | null;
  sitemapIncluded: boolean;
  lastmod: string | null;
  robotsBlocked: boolean;
  noindex: boolean;
  canonical: string | null;
  canonicalMatches: boolean;
  title: string | null;
  eligible: boolean;
  action: string;
  error: string | null;
};

export type IndexationSnapshot = {
  checkedAt: string;
  siteUrl: string;
  searchConsole: {
    status: "unavailable";
    note: string;
  };
  robotsOk: boolean;
  sitemapOk: boolean;
  checks: IndexationCheck[];
  summary: {
    total: number;
    eligible: number;
    needsAction: number;
    sitemapIncluded: number;
  };
};

const coreTargets: readonly IndexationTarget[] = [
  { path: "/", label: "Homepage", group: "Core" },
  { path: "/services", label: "Services hub", group: "Core" },
  { path: "/packages", label: "Packages", group: "Commercial" },
  { path: "/pricing", label: "Pricing", group: "Commercial" },
  { path: "/trust", label: "Trust", group: "Core" },
];

export const indexationTargets: readonly IndexationTarget[] = [
  ...coreTargets,
  ...crawlPriorityServiceLinks.map((target) => ({
    path: target.href,
    label: target.label,
    group: "Commercial" as const,
  })),
  ...searchPlanningLinks.map((target) => ({
    path: target.href,
    label: target.label,
    group: "Planning" as const,
  })),
].filter((target, index, all) => all.findIndex((item) => item.path === target.path) === index);

function decodeXml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

export function parseSitemapEntries(xml: string) {
  const entries = new Map<string, string | null>();
  for (const block of xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)) {
    const loc = block[1].match(/<loc>([\s\S]*?)<\/loc>/i)?.[1]?.trim();
    if (!loc) continue;
    const lastmod = block[1].match(/<lastmod>([\s\S]*?)<\/lastmod>/i)?.[1]?.trim() ?? null;
    entries.set(decodeXml(loc), lastmod ? decodeXml(lastmod) : null);
  }
  return entries;
}

export function robotsDisallowsPath(robots: string, path: string) {
  const cleanPath = path.split("?")[0] || "/";
  return robots
    .split(/\r?\n/)
    .map((line) => line.replace(/#.*$/, "").trim())
    .filter((line) => /^disallow:/i.test(line))
    .map((line) => line.replace(/^disallow:\s*/i, "").trim())
    .filter(Boolean)
    .some((rule) => cleanPath === rule || cleanPath.startsWith(rule.endsWith("/") ? rule : `${rule}/`));
}

export function inspectIndexationHtml(html: string) {
  const canonicalTag =
    html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i)?.[0] ??
    html.match(/<link\b[^>]*\bhref=["'][^"']+["'][^>]*\brel=["']canonical["'][^>]*>/i)?.[0] ??
    null;
  const canonical = canonicalTag?.match(/\bhref=["']([^"']+)["']/i)?.[1] ?? null;
  const robotsMeta =
    html.match(/<meta\b[^>]*\bname=["']robots["'][^>]*>/i)?.[0] ??
    html.match(/<meta\b[^>]*\bcontent=["'][^"']+["'][^>]*\bname=["']robots["'][^>]*>/i)?.[0] ??
    "";
  const noindex = /noindex/i.test(robotsMeta);
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ?? null;
  return { canonical, noindex, title };
}

function normalizeUrl(value: string, base = SEO_SITE_URL) {
  const url = new URL(value, base);
  url.hash = "";
  url.search = "";
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/$/, "");
  return url.toString();
}

async function fetchText(url: string, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "SocialRUSH-Indexation-Command-Center/1.0" },
    });
    return { response, text: await response.text() };
  } finally {
    clearTimeout(timeout);
  }
}

function actionFor(check: Omit<IndexationCheck, "action" | "eligible">) {
  if (check.error) return "Retry live check";
  if (check.httpStatus !== 200) return "Fix HTTP status";
  if (check.noindex) return "Remove accidental noindex";
  if (check.robotsBlocked) return "Review robots.txt";
  if (!check.canonicalMatches) return "Fix canonical";
  if (!check.sitemapIncluded) return "Add to sitemap";
  return "Inspect in Google Search Console";
}

export async function getIndexationSnapshot(): Promise<IndexationSnapshot> {
  const sitemapUrl = new URL("/sitemap.xml", SEO_SITE_URL).toString();
  const robotsUrl = new URL("/robots.txt", SEO_SITE_URL).toString();

  let sitemapEntries = new Map<string, string | null>();
  let robots = "";
  let sitemapOk = false;
  let robotsOk = false;

  const [sitemapResult, robotsResult] = await Promise.allSettled([
    fetchText(sitemapUrl),
    fetchText(robotsUrl),
  ]);

  if (sitemapResult.status === "fulfilled" && sitemapResult.value.response.ok) {
    sitemapEntries = parseSitemapEntries(sitemapResult.value.text);
    sitemapOk = sitemapEntries.size > 0;
  }
  if (robotsResult.status === "fulfilled" && robotsResult.value.response.ok) {
    robots = robotsResult.value.text;
    robotsOk = robots.includes("Sitemap:");
  }

  const checks = await Promise.all(indexationTargets.map(async (target): Promise<IndexationCheck> => {
    const url = new URL(target.path, SEO_SITE_URL).toString();
    const expectedCanonical = normalizeUrl(url);
    const sitemapLastmod =
      sitemapEntries.get(url) ??
      sitemapEntries.get(expectedCanonical) ??
      null;
    const sitemapIncluded = sitemapEntries.has(url) || sitemapEntries.has(expectedCanonical);
    const robotsBlocked = robots ? robotsDisallowsPath(robots, target.path) : false;

    let partial: Omit<IndexationCheck, "action" | "eligible">;
    try {
      const { response, text } = await fetchText(url);
      const html = inspectIndexationHtml(text);
      const canonicalMatches = html.canonical
        ? normalizeUrl(html.canonical) === expectedCanonical
        : false;
      const headerNoindex = /noindex/i.test(response.headers.get("x-robots-tag") ?? "");
      partial = {
        ...target,
        url,
        httpStatus: response.status,
        sitemapIncluded,
        lastmod: sitemapLastmod,
        robotsBlocked,
        noindex: html.noindex || headerNoindex,
        canonical: html.canonical,
        canonicalMatches,
        title: html.title,
        error: null,
      };
    } catch (error) {
      partial = {
        ...target,
        url,
        httpStatus: null,
        sitemapIncluded,
        lastmod: sitemapLastmod,
        robotsBlocked,
        noindex: false,
        canonical: null,
        canonicalMatches: false,
        title: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    const eligible =
      partial.httpStatus === 200 &&
      partial.sitemapIncluded &&
      !partial.robotsBlocked &&
      !partial.noindex &&
      partial.canonicalMatches;

    return {
      ...partial,
      eligible,
      action: actionFor(partial),
    };
  }));

  return {
    checkedAt: new Date().toISOString(),
    siteUrl: SEO_SITE_URL,
    searchConsole: {
      status: "unavailable",
      note: "Live Google indexed/not-indexed status is not available inside the app. Use Search Console URL Inspection for Google-selected canonical and indexing state.",
    },
    robotsOk,
    sitemapOk,
    checks,
    summary: {
      total: checks.length,
      eligible: checks.filter((check) => check.eligible).length,
      needsAction: checks.filter((check) => !check.eligible).length,
      sitemapIncluded: checks.filter((check) => check.sitemapIncluded).length,
    },
  };
}
