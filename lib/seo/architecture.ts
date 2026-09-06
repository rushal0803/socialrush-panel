import { countryServicePaths, internationalHubPaths, publishedCountryServicePages } from "./international.ts";

export type SeoIntentKind = "transactional" | "commercial-comparison" | "informational" | "platform-growth" | "country-transactional";

export type SeoIntent = {
  id: string;
  platform: "instagram" | "youtube" | "linkedin" | "twitter" | "facebook" | "tiktok" | "telegram" | "cross-platform";
  kind: SeoIntentKind;
  primaryTarget: string;
  protected?: true;
};

const protectedIndiaIntentTargets = [
  ["instagram-followers", "instagram", "/buy-instagram-followers-india"], ["instagram-likes", "instagram", "/instagram-likes"], ["instagram-views", "instagram", "/instagram-views"], ["instagram-comments", "instagram", "/buy-instagram-comments-india"], ["instagram-saves", "instagram", "/buy-instagram-saves-india"], ["instagram-shares", "instagram", "/buy-instagram-shares-india"],
  ["youtube-subscribers", "youtube", "/youtube-subscribers"], ["youtube-likes", "youtube", "/youtube-likes"], ["youtube-views", "youtube", "/youtube-views"], ["youtube-comments", "youtube", "/buy-youtube-comments-india"],
  ["linkedin-followers", "linkedin", "/linkedin-followers"], ["linkedin-likes", "linkedin", "/linkedin-likes"], ["twitter-followers", "twitter", "/twitter-followers"],
  ["facebook-followers", "facebook", "/buy-facebook-followers-india"], ["facebook-group-members", "facebook", "/buy-facebook-group-members-india"], ["facebook-likes", "facebook", "/facebook-likes"], ["facebook-views", "facebook", "/facebook-views"],
  ["telegram-members", "telegram", "/telegram-members"], ["tiktok-followers", "tiktok", "/tiktok-followers"],
] as const satisfies readonly (readonly [string, SeoIntent["platform"], string])[];

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
  ...protectedIndiaIntentTargets.map(([id, platform, primaryTarget]) => ({
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

export const protectedIndiaSeoPaths = protectedIndiaIntentTargets.map(([, , path]) => path) as readonly string[];
export const indexableInternationalPaths = [...internationalHubPaths, ...countryServicePaths] as readonly string[];

export function hasUniquePrimaryTargets(intents = seoIntentMap) {
  return new Set(intents.map((intent) => intent.primaryTarget)).size === intents.length;
}

export function isPublishedInternationalPath(path: string) {
  return indexableInternationalPaths.includes(path);
}
