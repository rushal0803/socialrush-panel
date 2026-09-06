import {
  getDiscoveryWebsite,
  isLowQualityDiscoveryResult,
  type DiscoveryResult,
} from "./prospect-discovery-filters.ts";

const IGNORED_TOKENS = new Set(["the", "india", "private", "pvt", "ltd", "limited", "inc", "llp", "company", "co"]);
const GENERIC_NAMES = new Set(["india", "d2c", "marketing", "startup", "company", "companies", "linkedin"]);

export type CompanySeed = { companyName: string; title: string; url: string; description?: string };
export type OfficialResolution = { website: { domain: string; websiteUrl: string }; score: number; reasons: string[] };
export type RankedCompanySeed = CompanySeed & { seedFitScore: number; seedFitReasons: string[]; seedRejectedReason?: string; selectedForResolution?: boolean };

const HARD_REJECT_PATTERN = /\b(news|times|journal|magazine|directory|database|wiki|jobs?|careers?|job board|events?|conference|association|federation|forum|community|newsletter|insights|reports?|rankings?|startup news|business news)\b/i;
const ARTICLE_PATTERN = /\b(top companies|best startups|companies in india|top \d+|best \d+|\d+ startups?|how to|what is)\b|^\s*\d+\s+/i;
const SEGMENT_SIGNALS: Record<string, string[]> = { "marketing agency": ["agency", "marketing", "digital", "growth", "performance", "creative", "advertising", "social media", "branding"], "e-commerce brand": ["brand", "d2c", "consumer", "ecommerce", "e-commerce", "retail", "beauty", "skincare", "fashion", "wellness", "food", "lifestyle", "home"], startup: ["saas", "software", "platform", "technology", "technologies", "tech", "fintech", "app", "ai", "cloud", "startup", "solution", "solutions"], "creator business": ["creator", "influencer", "talent", "management", "creator agency", "influencer marketing", "content studio"], "professional services": ["consulting", "advisory", "consultancy", "services", "firm", "studio", "solutions"] };

function meaningfulWordCount(value: string) { return tokens(value).filter((token) => !GENERIC_NAMES.has(token)).length; }

/** Qualifies LinkedIn company seeds before spending the limited official-site search budget. */
export function rankCompanySeeds(seeds: CompanySeed[], segment: string): RankedCompanySeed[] {
  const signals = SEGMENT_SIGNALS[segment.toLowerCase()] || [];
  return seeds.map((seed) => {
    const name = seed.companyName.trim(), context = `${name} ${seed.title} ${seed.description || ""}`, reasons: string[] = [];
    if (!name || meaningfulWordCount(name) === 0) return { ...seed, seedFitScore: 0, seedFitReasons: reasons, seedRejectedReason: "blank_or_malformed_company_name" };
    if (HARD_REJECT_PATTERN.test(context)) return { ...seed, seedFitScore: 0, seedFitReasons: reasons, seedRejectedReason: "publication_listing_or_community_style_name" };
    if (ARTICLE_PATTERN.test(context)) return { ...seed, seedFitScore: 0, seedFitReasons: reasons, seedRejectedReason: "article_or_listicle_style_name" };
    const words = meaningfulWordCount(name);
    if (words > 6) return { ...seed, seedFitScore: 0, seedFitReasons: reasons, seedRejectedReason: "excessive_company_name_words" };
    let score = 25;
    if (words >= 1 && words <= 6) { score += 20; reasons.push("concise company-like name"); }
    if (isLinkedInCompanyUrl(seed.url)) { score += 15; reasons.push("LinkedIn company-profile URL"); }
    if (name.toLowerCase() !== "linkedin" && seed.title.toLowerCase().includes(name.toLowerCase())) { score += 10; reasons.push("company name appears in title"); }
    const matchedSignals = signals.filter((signal) => context.toLowerCase().includes(signal.toLowerCase()));
    if (matchedSignals.length) { score += Math.min(30, matchedSignals.length * 10); reasons.push(`segment signals: ${matchedSignals.slice(0, 3).join(", ")}`); }
    if (/\?|\b(top|best|list|ranking)\b/i.test(context)) { score -= 25; reasons.push("generic or list-style wording"); }
    return { ...seed, seedFitScore: Math.max(0, Math.min(100, score)), seedFitReasons: reasons };
  }).sort((a, b) => b.seedFitScore - a.seedFitScore || a.companyName.localeCompare(b.companyName));
}

export function selectCompanySeeds(seeds: CompanySeed[], segment: string, maxResolutions: number, minimumScore = 50) {
  const ranked = rankCompanySeeds(seeds, segment); let selected = 0;
  return ranked.map((seed) => { const selectedForResolution = !seed.seedRejectedReason && seed.seedFitScore >= minimumScore && selected < maxResolutions; if (selectedForResolution) selected++; return { ...seed, selectedForResolution }; });
}

function tokens(value: string) {
  return value.toLowerCase().replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[^a-z0-9]+/g, " ").split(" ").filter((token) => token.length > 1 && !IGNORED_TOKENS.has(token));
}

export function normalizeCompanyName(value: string) {
  return tokens(value).join(" ");
}

/** Comparison form for brands where punctuation is meaningful in prose but not domains. */
export function normalizeCompanyComparison(value: string) {
  return normalizeCompanyName(value).replace(/\s+/g, "");
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
  const domainLabels = website.domain.split(".").filter(Boolean);
  const domainTokens = tokens(domainLabels[0] || website.domain);
  const companyComparison = normalizeCompanyComparison(companyName);
  const domainComparison = domainLabels.join("").replace(/[^a-z0-9]/gi, "").toLowerCase();
  const labelComparison = (domainLabels[0] || "").replace(/[^a-z0-9]/gi, "").toLowerCase();
  const titleAndSnippet = `${result.title || ""} ${result.description || ""}`.toLowerCase();
  const overlap = companyTokens.filter((token) => domainTokens.includes(token));
  const textOverlap = companyTokens.filter((token) => titleAndSnippet.includes(token));
  const reasons: string[] = [];
  let score = 0;
  const exactDomainBrandMatch = Boolean(companyComparison) && (companyComparison === labelComparison || companyComparison === domainComparison);
  if (exactDomainBrandMatch) { score += 65; reasons.push("normalized brand exactly matches domain"); }
  else if (overlap.length) { score += overlap.length >= Math.min(2, companyTokens.length) ? 55 : 38; reasons.push(`domain matches ${overlap.join(", ")}`); }
  if (textOverlap.length) { score += textOverlap.length >= Math.min(2, companyTokens.length) ? 20 : 10; reasons.push("title or snippet matches company name"); }
  try {
    const path = new URL(result.url || "").pathname;
    if (path === "/" || path.split("/").filter(Boolean).length <= 1) { score += 10; reasons.push("homepage or near-root result"); }
  } catch { return null; }
  if (companyTokens.length > 0 && overlap.length === 0 && !exactDomainBrandMatch) return null;
  if (score < 70) return null;
  return { website, score: Math.min(score, 100), reasons };
}
