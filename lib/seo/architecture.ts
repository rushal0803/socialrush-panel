import { countryServicePaths, internationalHubPaths, publishedCountryServicePages } from "./international.ts";
import { canonicalIndiaServicePaths, indiaServiceSlugs, type IndiaServiceSlug } from "./india-service-pages.ts";

export type SeoIntentKind = "transactional" | "commercial-comparison" | "informational" | "platform-growth" | "country-transactional";

export type SeoIntent = {
  id: string;
  platform: "instagram" | "youtube" | "linkedin" | "twitter" | "facebook" | "tiktok" | "telegram" | "cross-platform";
  kind: SeoIntentKind;
  primaryTarget: string;
  protected?: true;
};

function indiaPlatform(slug: IndiaServiceSlug): SeoIntent["platform"] {
  if (slug.includes("instagram")) return "instagram";
  if (slug.includes("youtube")) return "youtube";
  if (slug.includes("linkedin")) return "linkedin";
  if (slug.includes("twitter")) return "twitter";
  if (slug.includes("facebook")) return "facebook";
  if (slug.includes("tiktok")) return "tiktok";
  return "telegram";
}

const protectedIndiaIntentTargets = indiaServiceSlugs.map((slug) => ({
  id: slug,
  platform: indiaPlatform(slug),
  primaryTarget: canonicalIndiaServicePaths[slug],
}));

/**
 * One primary target per deliberately-targeted search intent. This is a
 * routing guard, not a keyword list: variations should strengthen these
 * pages instead of creating another route.
 */
export const seoIntentMap: readonly SeoIntent[] = [
  { id: "instagram-growth-india", platform: "instagram", kind: "platform-growth", primaryTarget: "/instagram-growth-india" },
  { id: "youtube-growth-india", platform: "youtube", kind: "platform-growth", primaryTarget: "/youtube-growth-india" },
  { id: "linkedin-growth-india", platform: "linkedin", kind: "platform-growth", primaryTarget: "/linkedin-growth-india" },
  { id: "x-growth-india", platform: "twitter", kind: "platform-growth", primaryTarget: "/x-growth-india" },
  { id: "facebook-growth-india", platform: "facebook", kind: "platform-growth", primaryTarget: "/facebook-growth-india" },
  { id: "tiktok-growth-india", platform: "tiktok", kind: "platform-growth", primaryTarget: "/tiktok-growth-india" },
  { id: "social-media-service-comparison", platform: "cross-platform", kind: "commercial-comparison", primaryTarget: "/services" },
  ...protectedIndiaIntentTargets.map(({ id, platform, primaryTarget }) => ({
    id: `india-${id}`,
    platform,
    kind: "transactional" as const,
    primaryTarget,
    protected: true as const,
  })),
  ...publishedCountryServicePages.map((page) => ({
    id: `${page.market.slug}-${page.serviceSlug}`,
    platform: toIntentPlatform(page.platform),
    kind: "country-transactional" as const,
    primaryTarget: `/${page.market.slug}/${page.serviceSlug}`,
  })),
];

function toIntentPlatform(platform: "instagram" | "youtube" | "facebook" | "linkedin" | "telegram" | "tiktok" | "x"): SeoIntent["platform"] {
  return platform === "x" ? "twitter" : platform;
}

export const protectedIndiaSeoPaths = indiaServiceSlugs.map((slug) => canonicalIndiaServicePaths[slug]) as readonly string[];
export const indexableInternationalPaths = [...internationalHubPaths, ...countryServicePaths] as readonly string[];

export function hasUniquePrimaryTargets(intents = seoIntentMap) {
  return new Set(intents.map((intent) => intent.primaryTarget)).size === intents.length;
}

export function isPublishedInternationalPath(path: string) {
  return indexableInternationalPaths.includes(path);
}
