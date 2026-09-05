export type DiscoveryResult = { title?: string; url?: string; description?: string };

function normalizeDiscoveryDomain(value: string) {
  return value.trim().toLowerCase().replace(/^www\./, "").split(/[/?#]/)[0] || null;
}

const BLOCKED_DOMAINS = [
  "linkedin.com", "facebook.com", "instagram.com", "youtube.com", "youtu.be", "tiktok.com", "twitter.com", "x.com", "pinterest.com",
  "clutch.co", "designrush.com", "goodfirms.co", "yelp.com", "yellowpages.com", "crunchbase.com", "zoominfo.com", "apollo.io", "rocketreach.co", "signalhire.com",
  "companydatabase.in", "scribd.com", "golden.com", "ibef.org", "builtin.com", "vcsdata.com", "justdial.com", "indiamart.com", "sulekha.com", "tradeindia.com", "zaubacorp.com", "thecompanycheck.com", "kompass.com", "dnb.com",
  "indeed.com", "glassdoor.com", "ziprecruiter.com", "wikipedia.org", "reddit.com", "medium.com", "substack.com", "github.com", "quora.com", "google.com", "bing.com", "yahoo.com", "brave.com",
];
const DOCUMENT_PATH = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i;
const LOW_QUALITY_TEXT = /\b(top\s+\d+|best\s+(?:companies|company|agencies|agency|brands|startups)|list\s+of|companies?\s+in\s+india|search\s+list\s+of|discover\s+the\s+top|directory|database|rankings?|report|whitepaper)\b/i;
const ARTICLE_PATH = /\/(?:blog|news|article|articles|report|reports|research|resources)\//i;

export function isBlockedDiscoveryDomain(domain: string) {
  return BLOCKED_DOMAINS.some((blocked) => domain === blocked || domain.endsWith(`.${blocked}`));
}

export function getDiscoveryWebsite(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    const domain = normalizeDiscoveryDomain(parsed.hostname);
    if (!domain || isBlockedDiscoveryDomain(domain)) return null;
    if (domain.endsWith(".gov") || domain.endsWith(".gov.au") || domain.endsWith(".edu") || domain.endsWith(".gov.in") || domain.endsWith(".nic.in") || domain.endsWith(".ac.in") || domain.endsWith(".edu.in")) return null;
    if (DOCUMENT_PATH.test(parsed.pathname)) return null;
    return { domain, websiteUrl: `${parsed.protocol}//${parsed.hostname}` };
  } catch { return null; }
}

/** Deterministic pre-insert guard for results that are not company websites. */
export function isLowQualityDiscoveryResult(result: DiscoveryResult) {
  const title = result.title || "";
  const description = result.description || "";
  try {
    const parsed = new URL(result.url || "");
    if (DOCUMENT_PATH.test(parsed.pathname) || ARTICLE_PATH.test(parsed.pathname)) return true;
  } catch { return true; }
  return LOW_QUALITY_TEXT.test(`${title} ${description}`);
}
