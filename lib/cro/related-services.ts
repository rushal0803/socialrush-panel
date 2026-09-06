import type { SmmService } from "@/lib/smm-service-catalog";

/** Explainable service-family suggestions; candidates are always rechecked against the active catalog. */
const relatedByCode: Record<string, readonly string[]> = {
  "instagram-followers": ["instagram-likes", "instagram-views", "instagram-comments"],
  "youtube-subscribers": ["youtube-views", "youtube-watch-hours", "youtube-likes"],
  "linkedin-followers": ["linkedin-usa-connections", "linkedin-usa-group-members", "linkedin-likes"],
  "x-followers": ["twitter-likes", "twitter-views", "twitter-retweets"],
};

export function relatedServices(sourceCode: string, catalog: readonly SmmService[], limit = 3): SmmService[] {
  const active = new Map<string, SmmService>(catalog.filter((service) => service.isActive).map((service) => [service.code, service]));
  const candidates = relatedByCode[sourceCode] ?? [];
  const seen = new Set<string>();
  return candidates.map((code) => active.get(code)).filter((service): service is SmmService => Boolean(service) && service.code !== sourceCode && !seen.has(service.code) && (seen.add(service.code), true)).slice(0, Math.max(0, limit));
}

export function relatedLabel(service: SmmService) { return `Explore more ${service.platform === "x" ? "Twitter / X" : service.platform[0].toUpperCase() + service.platform.slice(1)} services`; }
