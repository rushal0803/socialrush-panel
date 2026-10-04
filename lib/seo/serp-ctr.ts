import { SEO_SITE_URL } from "@/lib/seo/metadata";
import { crawlPriorityServiceLinks, searchPlanningLinks } from "@/lib/seo/search-priority";

export type SerpCtrIssueSeverity = "high" | "medium" | "low";

export type SerpCtrIssue = {
  severity: SerpCtrIssueSeverity;
  code: string;
  message: string;
};

export type SerpCtrTarget = {
  path: string;
  label: string;
  group: "Core" | "Commercial" | "Planning";
};

export type SerpCtrCheck = SerpCtrTarget & {
  url: string;
  httpStatus: number | null;
  title: string | null;
  description: string | null;
  canonical: string | null;
  titleLength: number;
  descriptionLength: number;
  score: number;
  issues: SerpCtrIssue[];
  error: string | null;
};

export type SerpCtrSnapshot = {
  checkedAt: string;
  checks: SerpCtrCheck[];
  summary: {
    total: number;
    healthy: number;
    review: number;
    action: number;
    duplicateTitles: number;
    duplicateDescriptions: number;
  };
  note: string;
};

const coreTargets: readonly SerpCtrTarget[] = [
  { path: "/", label: "Homepage", group: "Core" },
  { path: "/services", label: "Services", group: "Core" },
  { path: "/packages", label: "Packages", group: "Commercial" },
  { path: "/trust", label: "Trust", group: "Core" },
  { path: "/for-agencies", label: "For Agencies", group: "Commercial" },
];

export const serpCtrTargets: readonly SerpCtrTarget[] = [
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
].filter((target, index, all) => all.findIndex((candidate) => candidate.path === target.path) === index);

function normalizeUrl(value: string, base = SEO_SITE_URL) {
  const url = new URL(value, base);
  url.hash = "";
  url.search = "";
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/$/, "");
  return url.toString();
}

function extractTag(html: string, patternA: RegExp, patternB?: RegExp) {
  return html.match(patternA)?.[0] ?? (patternB ? html.match(patternB)?.[0] : null) ?? null;
}

export function inspectSerpHtml(html: string) {
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() || null;
  const descriptionTag = extractTag(
    html,
    /<meta\b[^>]*\bname=["']description["'][^>]*>/i,
    /<meta\b[^>]*\bcontent=["'][^"']*["'][^>]*\bname=["']description["'][^>]*>/i,
  );
  const description = descriptionTag?.match(/\bcontent=["']([^"']*)["']/i)?.[1]?.trim() || null;
  const canonicalTag = extractTag(
    html,
    /<link\b[^>]*\brel=["']canonical["'][^>]*>/i,
    /<link\b[^>]*\bhref=["'][^"']+["'][^>]*\brel=["']canonical["'][^>]*>/i,
  );
  const canonical = canonicalTag?.match(/\bhref=["']([^"']+)["']/i)?.[1] ?? null;
  return { title, description, canonical };
}

export function evaluateSerpSnippet({
  title,
  description,
  group,
}: {
  title: string | null;
  description: string | null;
  group: SerpCtrTarget["group"];
}) {
  const issues: SerpCtrIssue[] = [];
  let score = 100;
  const titleLength = title?.length ?? 0;
  const descriptionLength = description?.length ?? 0;

  if (!title) {
    issues.push({ severity: "high", code: "missing-title", message: "Title tag is missing." });
    score -= 45;
  } else {
    if (titleLength < 28) {
      issues.push({ severity: "medium", code: "short-title", message: "Title may be too short to communicate the page intent clearly." });
      score -= 10;
    }
    if (titleLength > 65) {
      issues.push({ severity: "medium", code: "long-title", message: "Title has elevated truncation risk; review wording priority." });
      score -= 10;
    }
  }

  if (!description) {
    issues.push({ severity: "high", code: "missing-description", message: "Meta description is missing." });
    score -= 40;
  } else {
    if (descriptionLength < 90) {
      issues.push({ severity: "low", code: "short-description", message: "Description may be too short to communicate useful differentiators." });
      score -= 5;
    }
    if (descriptionLength > 175) {
      issues.push({ severity: "medium", code: "long-description", message: "Description has elevated truncation risk; front-load the strongest value." });
      score -= 8;
    }

    if (group === "Commercial") {
      if (!/price|pricing|inr|₹/i.test(description)) {
        issues.push({ severity: "medium", code: "missing-price-signal", message: "Commercial description does not mention pricing or INR context." });
        score -= 8;
      }
      if (!/public|password|tracking|delivery|refill/i.test(description)) {
        issues.push({ severity: "medium", code: "missing-trust-signal", message: "Commercial description lacks a concrete ordering, safety, or tracking signal." });
        score -= 8;
      }
    }
  }

  return {
    score: Math.max(0, score),
    titleLength,
    descriptionLength,
    issues,
  };
}

async function fetchText(url: string, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "SocialRUSH-Phase28-SERP-CTR/1.0" },
    });
    return { response, text: await response.text() };
  } finally {
    clearTimeout(timeout);
  }
}

export async function getSerpCtrSnapshot(): Promise<SerpCtrSnapshot> {
  const checks = await Promise.all(serpCtrTargets.map(async (target): Promise<SerpCtrCheck> => {
    const url = new URL(target.path, SEO_SITE_URL).toString();
    try {
      const { response, text } = await fetchText(url);
      const html = inspectSerpHtml(text);
      const evaluated = evaluateSerpSnippet({ title: html.title, description: html.description, group: target.group });
      const issues = [...evaluated.issues];

      if (response.status !== 200) {
        issues.unshift({ severity: "high", code: "http-status", message: `Expected HTTP 200 but received ${response.status}.` });
      }
      if (!html.canonical || normalizeUrl(html.canonical) !== normalizeUrl(url)) {
        issues.unshift({ severity: "high", code: "canonical", message: "Canonical does not match the intended SERP URL." });
      }

      return {
        ...target,
        url,
        httpStatus: response.status,
        title: html.title,
        description: html.description,
        canonical: html.canonical,
        ...evaluated,
        issues,
        score: Math.max(0, evaluated.score - issues.filter((issue) => issue.code === "http-status" || issue.code === "canonical").length * 20),
        error: null,
      };
    } catch (error) {
      return {
        ...target,
        url,
        httpStatus: null,
        title: null,
        description: null,
        canonical: null,
        titleLength: 0,
        descriptionLength: 0,
        score: 0,
        issues: [{ severity: "high", code: "fetch", message: "Live snippet check failed." }],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }));

  const titleOwners = new Map<string, SerpCtrCheck[]>();
  const descriptionOwners = new Map<string, SerpCtrCheck[]>();
  for (const check of checks) {
    if (check.title) titleOwners.set(check.title, [...(titleOwners.get(check.title) ?? []), check]);
    if (check.description) descriptionOwners.set(check.description, [...(descriptionOwners.get(check.description) ?? []), check]);
  }

  let duplicateTitles = 0;
  let duplicateDescriptions = 0;
  for (const group of titleOwners.values()) {
    if (group.length < 2) continue;
    duplicateTitles += group.length;
    for (const check of group) {
      check.issues.push({ severity: "high", code: "duplicate-title", message: "Title duplicates another priority URL." });
      check.score = Math.max(0, check.score - 20);
    }
  }
  for (const group of descriptionOwners.values()) {
    if (group.length < 2) continue;
    duplicateDescriptions += group.length;
    for (const check of group) {
      check.issues.push({ severity: "medium", code: "duplicate-description", message: "Description duplicates another priority URL." });
      check.score = Math.max(0, check.score - 10);
    }
  }

  const status = (check: SerpCtrCheck) => {
    if (check.issues.some((issue) => issue.severity === "high")) return "action";
    if (check.issues.length) return "review";
    return "healthy";
  };

  return {
    checkedAt: new Date().toISOString(),
    checks,
    summary: {
      total: checks.length,
      healthy: checks.filter((check) => status(check) === "healthy").length,
      review: checks.filter((check) => status(check) === "review").length,
      action: checks.filter((check) => status(check) === "action").length,
      duplicateTitles,
      duplicateDescriptions,
    },
    note:
      "Title and description length checks are editorial heuristics, not guarantees of how Google will render a snippet. This dashboard does not claim measured CTR, rankings, impressions or clicks.",
  };
}
