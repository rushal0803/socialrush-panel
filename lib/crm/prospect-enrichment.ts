import "server-only";
import { lookup, resolveMx } from "node:dns/promises";

export type OfficialSiteEnrichment = {
  businessEmail: string | null;
  emailVerified: boolean;
  emailSourceUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  youtubeUrl: string | null;
  tiktokUrl: string | null;
};

const MAX_HTML_BYTES = 1_500_000;
const FETCH_TIMEOUT_MS = 8_000;
const PAGE_PATHS = ["", "/contact", "/contact-us", "/about", "/about-us"];
const REJECTED_LOCAL_PARTS = /^(?:no-?reply|noreply|privacy|abuse|webmaster|security|legal)$/i;
const PREFERRED_LOCAL_PARTS = [
  "growth", "marketing", "partnerships", "business", "sales", "hello", "contact", "info", "team", "admin", "support",
];
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.in", "outlook.com", "hotmail.com", "live.com",
  "icloud.com", "me.com", "proton.me", "protonmail.com", "aol.com",
]);

function isPrivateIpv4(ip: string) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) return false;
  return parts[0] === 10
    || parts[0] === 127
    || (parts[0] === 169 && parts[1] === 254)
    || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
    || (parts[0] === 192 && parts[1] === 168)
    || parts[0] === 0;
}

function isPrivateAddress(ip: string) {
  const normalized = ip.toLowerCase();
  return isPrivateIpv4(normalized)
    || normalized === "::1"
    || normalized === "::"
    || normalized.startsWith("fc")
    || normalized.startsWith("fd")
    || normalized.startsWith("fe80:");
}

async function publicHostname(hostname: string) {
  if (!hostname || hostname === "localhost") return false;
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) || hostname.includes(":")) return false;
  try {
    const addresses = await Promise.race([
      lookup(hostname, { all: true }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("DNS lookup timeout")), 3_000)),
    ]);
    return addresses.length > 0 && addresses.every((entry) => !isPrivateAddress(entry.address));
  } catch {
    return false;
  }
}

function normalizeDomain(value: string) {
  return value.trim().toLowerCase().replace(/^www\./, "");
}

function domainMatches(candidate: string, businessDomain: string) {
  const emailDomain = normalizeDomain(candidate);
  const root = normalizeDomain(businessDomain);
  return emailDomain === root || emailDomain.endsWith(\`.\${root}\`);
}

function cleanEmail(value: string) {
  return value.trim().toLowerCase().replace(/^mailto:/i, "").split(/[?#]/)[0];
}

function extractEmails(html: string, businessDomain: string) {
  const decoded = html.replace(/&#64;|&commat;/gi, "@").replace(/&#46;|&period;/gi, ".");
  const values = new Set<string>();
  const mailto = decoded.match(/mailto:[^"'\s<>]+/gi) || [];
  const inline = decoded.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  for (const raw of [...mailto, ...inline]) {
    const email = cleanEmail(raw);
    const [local, domain] = email.split("@");
    if (!local || !domain || FREE_EMAIL_DOMAINS.has(domain) || REJECTED_LOCAL_PARTS.test(local)) continue;
    if (!domainMatches(domain, businessDomain)) continue;
    values.add(email);
  }
  return [...values].sort((a, b) => {
    const aLocal = a.split("@")[0], bLocal = b.split("@")[0];
    const aIndex = PREFERRED_LOCAL_PARTS.indexOf(aLocal), bIndex = PREFERRED_LOCAL_PARTS.indexOf(bLocal);
    const aRank = aIndex >= 0 ? aIndex : PREFERRED_LOCAL_PARTS.length;
    const bRank = bIndex >= 0 ? bIndex : PREFERRED_LOCAL_PARTS.length;
    return aRank - bRank || a.localeCompare(b);
  });
}

function firstSocial(html: string, pattern: RegExp) {
  const match = html.match(pattern)?.[0];
  return match ? match.replace(/&amp;/g, "&").replace(/[)"'<>,]+$/g, "") : null;
}

function extractSocials(html: string) {
  return {
    instagramUrl: firstSocial(html, /https?:\/\/(?:www\.)?instagram\.com\/[A-Za-z0-9._-]+\/?/i),
    linkedinUrl: firstSocial(html, /https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/(?:company|in)\/[A-Za-z0-9%._-]+\/?/i),
    youtubeUrl: firstSocial(html, /https?:\/\/(?:www\.)?youtube\.com\/(?:@|channel\/|c\/|user\/)[A-Za-z0-9._%-]+\/?/i),
    tiktokUrl: firstSocial(html, /https?:\/\/(?:www\.)?tiktok\.com\/@[A-Za-z0-9._-]+\/?/i),
  };
}

async function hasMx(email: string) {
  const domain = email.split("@")[1];
  if (!domain) return false;
  try {
    const records = await Promise.race([
      resolveMx(domain),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("MX lookup timeout")), 3_000)),
    ]);
    return records.length > 0;
  } catch {
    return false;
  }
}

async function fetchHtml(url: URL, businessDomain: string) {
  if (!domainMatches(url.hostname, businessDomain) || !(await publicHostname(url.hostname))) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "SocialRUSH-ProspectResearch/1.0 (+https://www.getsocialrush.com)",
      },
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const finalUrl = new URL(response.url);
    if (!domainMatches(finalUrl.hostname, businessDomain)) return null;
    const type = response.headers.get("content-type") || "";
    if (!type.includes("text/html") && !type.includes("application/xhtml+xml")) return null;
    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > MAX_HTML_BYTES) return null;
    return { html: (await response.text()).slice(0, MAX_HTML_BYTES), finalUrl: finalUrl.toString() };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function enrichOfficialBusinessWebsite(websiteUrl: string, businessDomain: string): Promise<OfficialSiteEnrichment> {
  const base = new URL(websiteUrl);
  const normalizedDomain = normalizeDomain(businessDomain || base.hostname);
  const emails: Array<{ email: string; sourceUrl: string }> = [];
  let instagramUrl: string | null = null;
  let linkedinUrl: string | null = null;
  let youtubeUrl: string | null = null;
  let tiktokUrl: string | null = null;

  for (const path of PAGE_PATHS) {
    const pageUrl = new URL(path || "/", base.origin);
    const fetched = await fetchHtml(pageUrl, normalizedDomain);
    if (!fetched) continue;
    for (const email of extractEmails(fetched.html, normalizedDomain)) {
      if (!emails.some((entry) => entry.email === email)) emails.push({ email, sourceUrl: fetched.finalUrl });
    }
    const socials = extractSocials(fetched.html);
    instagramUrl ||= socials.instagramUrl;
    linkedinUrl ||= socials.linkedinUrl;
    youtubeUrl ||= socials.youtubeUrl;
    tiktokUrl ||= socials.tiktokUrl;
    if (emails.length && (instagramUrl || linkedinUrl || youtubeUrl || tiktokUrl)) break;
  }

  const selected = emails[0] || null;
  const emailVerified = selected ? await hasMx(selected.email) : false;
  return {
    businessEmail: selected?.email || null,
    emailVerified,
    emailSourceUrl: selected?.sourceUrl || null,
    instagramUrl,
    linkedinUrl,
    youtubeUrl,
    tiktokUrl,
  };
}
