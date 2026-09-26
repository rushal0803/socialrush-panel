import { contentClusters, type ContentPlatform } from "./content-clusters";

export type AuthorityTarget = Readonly<{
  label: string;
  href: string;
  kind: "hub" | "service" | "guide" | "tool" | "pricing";
}>;

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

  return [
    { label: cluster.hubLabel, href: cluster.hubPath, kind: "hub" },
    ...(primaryService
      ? [{ label: primaryService.label, href: primaryService.href, kind: "service" as const }]
      : []),
    ...(priceGuide
      ? [{ label: priceGuide.label, href: priceGuide.href, kind: "guide" as const }]
      : []),
    { label: "Compare current pricing", href: "/pricing", kind: "pricing" },
    { label: "Estimate a service cost", href: "/tools/social-media-service-cost-calculator", kind: "tool" },
  ];
}

export function uniqueAuthorityTargets(targets: readonly AuthorityTarget[]) {
  const seen = new Set<string>();
  return targets.filter((target) => {
    if (seen.has(target.href)) return false;
    seen.add(target.href);
    return true;
  });
}
