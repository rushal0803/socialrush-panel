import { contentClusters, type ContentPlatform } from "./content-clusters.ts";
import { internationalAuthorityMarkets } from "./international-authority.ts";
import { canonicalOwnerForPath, isCommercialAliasPath } from "./query-ownership.ts";

export type AuthorityKind =
  | "hub"
  | "service"
  | "guide"
  | "tool"
  | "pricing"
  | "country-hub"
  | "country-service";

export type AuthorityTarget = Readonly<{
  label: string;
  href: string;
  kind: AuthorityKind;
}>;

export type AuthorityEdge = Readonly<{
  from: string;
  to: string;
  relation:
    | "hub-to-service"
    | "hub-to-guide"
    | "money-to-hub"
    | "money-to-sibling"
    | "money-to-guide"
    | "guide-to-hub"
    | "guide-to-service"
    | "catalog-to-country"
    | "country-to-service"
    | "service-to-country-hub";
}>;

export type AuthorityNode = Readonly<{
  path: string;
  label: string;
  kind: AuthorityKind;
  platform: ContentPlatform | null;
  inbound: number;
  outbound: number;
}>;

export const organicAuthorityExcludedPaths = [
  "/services/tiktok-likes",
  "/services/tiktok-views",
  "/services/tiktok-custom-comments",
  "/services/tiktok-story-views",
  "/services/tiktok-saves",
] as const;

export const guideServiceAuthorityMap: Readonly<Record<string, readonly string[]>> = {
  "/blog/instagram-followers-vs-likes-india": ["/buy-instagram-followers-india", "/instagram-likes"],
  "/blog/instagram-followers-vs-engagement": ["/buy-instagram-followers-india", "/instagram-likes", "/instagram-views"],
  "/blog/instagram-views-vs-reach": ["/instagram-views"],
  "/blog/youtube-subscribers-vs-views-india": ["/youtube-subscribers", "/youtube-views"],
  "/blog/youtube-views-price-in-india": ["/youtube-views"],
  "/blog/is-it-safe-to-buy-youtube-views": ["/youtube-views"],
  "/blog/linkedin-followers-vs-engagement-india": ["/linkedin-followers", "/linkedin-likes"],
  "/blog/facebook-followers-vs-engagement-india": ["/buy-facebook-followers-india", "/facebook-likes", "/facebook-views"],
  "/blog/twitter-followers-price-in-india": ["/twitter-followers"],
  "/blog/telegram-members-price-in-india": ["/telegram-members"],
} as const;

const excluded = new Set<string>(organicAuthorityExcludedPaths);

function cleanPath(path: string) {
  const value = path.split("#")[0]?.split("?")[0] || "/";
  if (value === "/") return value;
  return value.replace(/\/$/, "");
}

export function canonicalAuthorityPath(path: string) {
  const cleaned = cleanPath(path);
  return canonicalOwnerForPath(cleaned)?.canonicalPath ?? cleaned;
}

export function uniqueAuthorityTargets(targets: readonly AuthorityTarget[]) {
  const seen = new Set<string>();
  return targets.filter((target) => {
    const canonical = canonicalAuthorityPath(target.href);
    if (excluded.has(canonical) || seen.has(canonical)) return false;
    seen.add(canonical);
    return true;
  }).map((target) => ({ ...target, href: canonicalAuthorityPath(target.href) }));
}

export function getPlatformAuthorityTargets(platform: ContentPlatform | null): readonly AuthorityTarget[] {
  if (!platform) {
    return [
      { label: "Compare SocialRUSH services", href: "/services", kind: "hub" },
      { label: "Compare current pricing", href: "/pricing", kind: "pricing" },
      { label: "Estimate a service cost", href: "/tools/social-media-service-cost-calculator", kind: "tool" },
    ];
  }

  const cluster = contentClusters[platform];
  const primaryService = cluster.serviceLinks[0];
  const priceGuide = cluster.guideLinks.find((guide) => /price|pricing/i.test(guide.label));
  const supportingGuide = cluster.guideLinks.find((guide) => guide.href !== priceGuide?.href);

  return uniqueAuthorityTargets([
    { label: cluster.hubLabel, href: cluster.hubPath, kind: "hub" },
    ...(primaryService
      ? [{ label: primaryService.label, href: primaryService.href, kind: "service" as const }]
      : []),
    ...(priceGuide
      ? [{ label: priceGuide.label, href: priceGuide.href, kind: "guide" as const }]
      : []),
    ...(!priceGuide && supportingGuide
      ? [{ label: supportingGuide.label, href: supportingGuide.href, kind: "guide" as const }]
      : []),
    { label: "Compare current pricing", href: "/pricing", kind: "pricing" },
    { label: "Estimate a service cost", href: "/tools/social-media-service-cost-calculator", kind: "tool" },
  ]);
}

export function getGuideAuthorityServiceHrefs(platform: ContentPlatform, guidePath: string): readonly string[] {
  const cluster = contentClusters[platform];
  const mapped = guideServiceAuthorityMap[canonicalAuthorityPath(guidePath)] ?? [];
  const clusterServices = new Map(
    cluster.serviceLinks.map((service) => [canonicalAuthorityPath(service.href), service.href]),
  );
  const validMapped = mapped
    .map((href) => canonicalAuthorityPath(href))
    .filter((href) => clusterServices.has(href));

  if (validMapped.length) return [...new Set(validMapped)];

  const primary = cluster.serviceLinks[0];
  return primary ? [canonicalAuthorityPath(primary.href)] : [];
}

export function getGuideAuthorityTargets(
  platform: ContentPlatform | null,
  guidePath: string,
): readonly AuthorityTarget[] {
  if (!platform) return getPlatformAuthorityTargets(null);

  const cluster = contentClusters[platform];
  const serviceHrefs = new Set(getGuideAuthorityServiceHrefs(platform, guidePath));

  return uniqueAuthorityTargets([
    { label: cluster.hubLabel, href: cluster.hubPath, kind: "hub" },
    ...cluster.serviceLinks
      .filter((service) => serviceHrefs.has(canonicalAuthorityPath(service.href)))
      .map((service) => ({ label: service.label, href: service.href, kind: "service" as const })),
    { label: "Compare current pricing", href: "/pricing", kind: "pricing" },
    { label: "Estimate a service cost", href: "/tools/social-media-service-cost-calculator", kind: "tool" },
  ]);
}

export function getMoneyPageAuthorityTargets(platform: ContentPlatform): readonly AuthorityTarget[] {
  const cluster = contentClusters[platform];
  const guideTargets = cluster.guideLinks.slice(0, 2).map((guide) => ({
    label: guide.label,
    href: guide.href,
    kind: "guide" as const,
  }));

  return uniqueAuthorityTargets([
    { label: cluster.hubLabel, href: cluster.hubPath, kind: "hub" },
    ...cluster.serviceLinks.map((service) => ({
      label: service.label,
      href: service.href,
      kind: "service" as const,
    })),
    ...guideTargets,
    { label: "Compare current pricing", href: "/pricing", kind: "pricing" },
  ]);
}

function pushEdge(edges: AuthorityEdge[], edge: AuthorityEdge) {
  const from = canonicalAuthorityPath(edge.from);
  const to = canonicalAuthorityPath(edge.to);
  if (from === to || excluded.has(from) || excluded.has(to)) return;
  if (isCommercialAliasPath(from) || isCommercialAliasPath(to)) return;
  if (edges.some((item) => item.from === from && item.to === to && item.relation === edge.relation)) return;
  edges.push({ ...edge, from, to });
}

export function buildInternalAuthorityEdges(): readonly AuthorityEdge[] {
  const edges: AuthorityEdge[] = [];

  for (const [platform, cluster] of Object.entries(contentClusters) as Array<[ContentPlatform, (typeof contentClusters)[ContentPlatform]]>) {
    for (const service of cluster.serviceLinks) {
      pushEdge(edges, { from: cluster.hubPath, to: service.href, relation: "hub-to-service" });
      pushEdge(edges, { from: service.href, to: cluster.hubPath, relation: "money-to-hub" });

      for (const sibling of cluster.serviceLinks) {
        if (sibling.href === service.href) continue;
        pushEdge(edges, { from: service.href, to: sibling.href, relation: "money-to-sibling" });
      }

      for (const guide of cluster.guideLinks.slice(0, 2)) {
        pushEdge(edges, { from: service.href, to: guide.href, relation: "money-to-guide" });
      }
    }

    for (const guide of cluster.guideLinks) {
      pushEdge(edges, { from: cluster.hubPath, to: guide.href, relation: "hub-to-guide" });
      pushEdge(edges, { from: guide.href, to: cluster.hubPath, relation: "guide-to-hub" });
      for (const serviceHref of getGuideAuthorityServiceHrefs(platform, guide.href)) {
        pushEdge(edges, { from: guide.href, to: serviceHref, relation: "guide-to-service" });
      }
    }
  }

  for (const market of internationalAuthorityMarkets) {
    pushEdge(edges, { from: "/services", to: market.hubHref, relation: "catalog-to-country" });
    for (const service of market.services) {
      pushEdge(edges, { from: market.hubHref, to: service.href, relation: "country-to-service" });
      pushEdge(edges, { from: service.href, to: market.hubHref, relation: "service-to-country-hub" });
    }
  }

  return edges;
}

export function buildInternalAuthoritySnapshot() {
  const edges = buildInternalAuthorityEdges();
  const labels = new Map<string, { label: string; kind: AuthorityKind; platform: ContentPlatform | null }>();

  for (const [platform, cluster] of Object.entries(contentClusters) as Array<[ContentPlatform, (typeof contentClusters)[ContentPlatform]]>) {
    labels.set(canonicalAuthorityPath(cluster.hubPath), { label: cluster.hubLabel, kind: "hub", platform });
    for (const service of cluster.serviceLinks) {
      labels.set(canonicalAuthorityPath(service.href), { label: service.label, kind: "service", platform });
    }
    for (const guide of cluster.guideLinks) {
      labels.set(canonicalAuthorityPath(guide.href), { label: guide.label, kind: "guide", platform });
    }
  }

  for (const market of internationalAuthorityMarkets) {
    labels.set(canonicalAuthorityPath(market.hubHref), { label: market.name, kind: "country-hub", platform: null });
    for (const service of market.services) {
      labels.set(canonicalAuthorityPath(service.href), { label: `${market.name}: ${service.label}`, kind: "country-service", platform: null });
    }
  }

  labels.set("/services", { label: "Services catalog", kind: "hub", platform: null });

  const nodes: AuthorityNode[] = [...labels.entries()].map(([path, meta]) => ({
    path,
    ...meta,
    inbound: edges.filter((edge) => edge.to === path).length,
    outbound: edges.filter((edge) => edge.from === path).length,
  }));

  const orphanServices = nodes.filter(
    (node) => (node.kind === "service" || node.kind === "country-service") && node.inbound === 0,
  );

  return {
    nodes,
    edges,
    orphanServices,
    excludedPaths: [...organicAuthorityExcludedPaths],
    summary: {
      nodes: nodes.length,
      edges: edges.length,
      serviceNodes: nodes.filter((node) => node.kind === "service").length,
      guideNodes: nodes.filter((node) => node.kind === "guide").length,
      internationalNodes: nodes.filter((node) => node.kind === "country-hub" || node.kind === "country-service").length,
      orphanServices: orphanServices.length,
    },
  };
}
