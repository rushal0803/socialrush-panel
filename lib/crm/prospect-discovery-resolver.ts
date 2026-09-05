import {
  getDiscoveryWebsite,
  isLowQualityDiscoveryResult,
  type DiscoveryResult,
} from "./prospect-discovery-filters.ts";

const IGNORED_TOKENS = new Set(["the", "india", "private", "pvt", "ltd", "limited", "inc", "llp", "company", "co"]);
const GENERIC_NAMES = new Set(["india", "d2c", "marketing", "startup", "company", "companies", "linkedin"]);

export type CompanySeed = { companyName: string; title: string; url: string; description?: string };
export type OfficialResolution = { website: { domain: string; websiteUrl: string }; score: number; reasons: string[] };

function tokens(value: string) {
  return value.toLowerCase().replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[^a-z0-9]+/g, " ").split(" ").filter((token) => token.length > 1 && !IGNORED_TOKENS.has(token));
}

export function normalizeCompanyName(value: string) {
  return tokens(value).join(" ");
}

export function isLinkedInCompanyUrl(value: string | undefined) {
  try {
    const parsed = new URL(value || "");
    return (parsed.hostname === "linkedin.com" || parsed.hostname.endsWith(".linkedin.com")) && /^\/company\/[^/]+\/?$/i.test(parsed.pathname);
  } catch { return false; }
}

export function extractCompanyNameFromLinkedInTitle(title: string | undefined) {
  const cleaned = (title || "").replace(/\s+(?:\||-|–|—)\s*linkedin\s*$/i, "").replace(/\s+linkedin\s*$/i, "").replace(/\s+/g, " ").trim();
  const normalized = normalizeCompanyName(cleaned);
  if (!cleaned || cleaned.length > 80 || normalized.length < 2 || GENERIC_NAMES.has(normalized)) return null;
  if (/\b(top|best|list|directory|jobs?|hiring|founder|manager|specialist|profile)\b/i.test(cleaned)) return null;
  return cleaned;
}

export function companySeedFromResult(result: DiscoveryResult): CompanySeed | null {
  if (!result.url || !isLinkedInCompanyUrl(result.url)) return null;
  const companyName = extractCompanyNameFromLinkedInTitle(result.title);
  return companyName ? { companyName, title: result.title || "", url: result.url, description: result.description } : null;
}

export function resolveOfficialWebsite(companyName: string, result: DiscoveryResult): OfficialResolution | null {
  const website = result.url ? getDiscoveryWebsite(result.url) : null;
  if (!website || isLowQualityDiscoveryResult(result)) return null;
  const companyTokens = tokens(companyName);
  const domainTokens = tokens(website.domain.split(".")[0] || website.domain);
  const titleAndSnippet = `${result.title || ""} ${result.description || ""}`.toLowerCase();
  const overlap = companyTokens.filter((token) => domainTokens.includes(token));
  const textOverlap = companyTokens.filter((token) => titleAndSnippet.includes(token));
  const reasons: string[] = [];
  let score = 0;
  if (overlap.length) { score += overlap.length >= Math.min(2, companyTokens.length) ? 55 : 38; reasons.push(`domain matches ${overlap.join(", ")}`); }
  if (textOverlap.length) { score += textOverlap.length >= Math.min(2, companyTokens.length) ? 20 : 10; reasons.push("title or snippet matches company name"); }
  try {
    const path = new URL(result.url || "").pathname;
    if (path === "/" || path.split("/").filter(Boolean).length <= 1) { score += 10; reasons.push("homepage or near-root result"); }
  } catch { return null; }
  if (companyTokens.length > 0 && overlap.length === 0) return null;
  if (score < 70) return null;
  return { website, score: Math.min(score, 100), reasons };
}
