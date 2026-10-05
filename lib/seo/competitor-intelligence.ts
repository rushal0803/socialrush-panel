export type CompetitorEvidenceKind =
  | "pricing"
  | "checkout"
  | "trust"
  | "content"
  | "tool"
  | "catalog";

export type CompetitorEvidence = Readonly<{
  id: string;
  kind: CompetitorEvidenceKind;
  observation: string;
  sourceUrl: string;
  reviewedAt: string;
  sourceType: "competitor-owned";
}>;

export type CompetitorProfile = Readonly<{
  id: string;
  name: string;
  domain: string;
  marketFocus: "India" | "Global";
  evidence: readonly CompetitorEvidence[];
}>;

export type CompetitiveOpportunity = Readonly<{
  id: string;
  title: string;
  status: "socialrush-advantage" | "parity" | "opportunity";
  priority: 1 | 2 | 3 | 4 | 5;
  rationale: string;
  relatedCompetitorIds: readonly string[];
  socialRushPath: string;
  recommendedAction: string;
}>;

export const competitorProfiles: readonly CompetitorProfile[] = [
  {
    id: "instaboostpanel",
    name: "InstaBoostPanel",
    domain: "instaboostpanel.com",
    marketFocus: "India",
    evidence: [
      {
        id: "instaboost-india-positioning",
        kind: "content",
        observation:
          "Its India-focused Instagram guide leads with rupee pricing, UPI/local payment familiarity, public-link/no-password ordering, delivery timing and refill language.",
        sourceUrl: "https://instaboostpanel.com/blog/buy-instagram-followers-india/",
        reviewedAt: "2026-10-05",
        sourceType: "competitor-owned",
      },
      {
        id: "instaboost-price-guide",
        kind: "pricing",
        observation:
          "The reviewed guide publishes an explicit per-1,000 Instagram follower price and compares package economics inside editorial content.",
        sourceUrl: "https://instaboostpanel.com/blog/buy-instagram-followers-india/",
        reviewedAt: "2026-10-05",
        sourceType: "competitor-owned",
      },
    ],
  },
  {
    id: "buzzoid-india",
    name: "Buzzoid India",
    domain: "buzzoid.in",
    marketFocus: "India",
    evidence: [
      {
        id: "buzzoid-inr-packages",
        kind: "pricing",
        observation:
          "Its India storefront exposes a scan-friendly INR product grid with fixed follower package sizes and visible package prices.",
        sourceUrl: "https://buzzoid.in/product-category/instagram-followers/",
        reviewedAt: "2026-10-05",
        sourceType: "competitor-owned",
      },
      {
        id: "buzzoid-product-checkout",
        kind: "checkout",
        observation:
          "Individual product pages use a simple product-detail and add-to-cart flow with profile URL or username guidance.",
        sourceUrl: "https://buzzoid.in/product/1000-instagram-followers/",
        reviewedAt: "2026-10-05",
        sourceType: "competitor-owned",
      },
    ],
  },
  {
    id: "socialwick",
    name: "SocialWick",
    domain: "socialwick.com",
    marketFocus: "Global",
    evidence: [
      {
        id: "socialwick-guest-checkout",
        kind: "checkout",
        observation:
          "The reviewed Instagram flow presents guest checkout and a direct service-order interface rather than requiring a long discovery path.",
        sourceUrl: "https://www.socialwick.com/instagram",
        reviewedAt: "2026-10-05",
        sourceType: "competitor-owned",
      },
      {
        id: "socialwick-refill",
        kind: "trust",
        observation:
          "The reviewed page gives refill protection prominent placement and explains public-profile/order conditions near checkout.",
        sourceUrl: "https://www.socialwick.com/instagram",
        reviewedAt: "2026-10-05",
        sourceType: "competitor-owned",
      },
    ],
  },
  {
    id: "twicsy",
    name: "Twicsy",
    domain: "twicsy.com",
    marketFocus: "Global",
    evidence: [
      {
        id: "twicsy-package-breadth",
        kind: "catalog",
        observation:
          "Its reviewed catalog groups Instagram, TikTok and YouTube followers, likes and views with simple starting-price anchors.",
        sourceUrl: "https://twicsy.com/about",
        reviewedAt: "2026-10-05",
        sourceType: "competitor-owned",
      },
      {
        id: "twicsy-package-scanability",
        kind: "pricing",
        observation:
          "Service sections emphasize package choice and starting price before deeper explanation, making the offer easy to scan.",
        sourceUrl: "https://twicsy.com/about",
        reviewedAt: "2026-10-05",
        sourceType: "competitor-owned",
      },
    ],
  },
] as const;

export const competitiveOpportunities: readonly CompetitiveOpportunity[] = [
  {
    id: "india-native-checkout",
    title: "Own India-native checkout clarity",
    status: "socialrush-advantage",
    priority: 5,
    rationale:
      "SocialRUSH already combines live INR totals, UPI ordering, public-link/no-password requirements and dashboard tracking in the same purchase path. Keep this combination explicit because India-focused competitors commonly foreground only part of that journey.",
    relatedCompetitorIds: ["instaboostpanel", "buzzoid-india"],
    socialRushPath: "/services",
    recommendedAction:
      "Preserve live-price calculators and reinforce the INR + UPI + dashboard-tracking sequence anywhere a commercial page is redesigned.",
  },
  {
    id: "package-scanability",
    title: "Make package choices instantly scannable",
    status: "opportunity",
    priority: 5,
    rationale:
      "Buzzoid India and Twicsy make package sizes and starting prices visually obvious. SocialRUSH has richer live pricing and service detail, but must keep preset quantities and larger-package paths easy to compare at a glance.",
    relatedCompetitorIds: ["buzzoid-india", "twicsy"],
    socialRushPath: "/packages",
    recommendedAction:
      "Use the existing live pricing source of truth to improve preset-package hierarchy without introducing static or invented discounts.",
  },
  {
    id: "tool-led-acquisition",
    title: "Strengthen tool-led acquisition",
    status: "opportunity",
    priority: 4,
    rationale:
      "Large growth brands use free utility tools as a low-friction acquisition path. SocialRUSH already has a service cost calculator; it can become a stronger organic entry point before adding any new tool.",
    relatedCompetitorIds: ["buzzoid-india"],
    socialRushPath: "/tools/social-media-service-cost-calculator",
    recommendedAction:
      "Improve internal promotion and search visibility of the existing calculator before building additional utilities.",
  },
  {
    id: "multi-platform-depth",
    title: "Protect multi-platform depth as a moat",
    status: "socialrush-advantage",
    priority: 4,
    rationale:
      "Competitor landing pages frequently concentrate on Instagram, TikTok and YouTube. SocialRUSH also has dedicated LinkedIn, Telegram, Facebook and X paths plus international market architecture.",
    relatedCompetitorIds: ["twicsy", "socialwick"],
    socialRushPath: "/services",
    recommendedAction:
      "Keep professional-network and messaging-platform services visible in navigation, content clusters and agency flows instead of letting Instagram dominate discovery.",
  },
  {
    id: "editorial-commercial-research",
    title: "Use evidence-led commercial research content",
    status: "parity",
    priority: 4,
    rationale:
      "India-focused competitors publish price and comparison guides around transactional queries. SocialRUSH now has a content engine and keyword-ownership guardrails, so it can compete without creating overlapping doorway pages.",
    relatedCompetitorIds: ["instaboostpanel"],
    socialRushPath: "/blog",
    recommendedAction:
      "Expand only content gaps approved by the Phase 27 engine and link them into Phase 29 authority paths; avoid unsupported competitor-review or ranking claims.",
  },
  {
    id: "guest-checkout-friction",
    title: "Measure checkout friction before copying guest checkout",
    status: "opportunity",
    priority: 3,
    rationale:
      "SocialWick visibly supports guest checkout. SocialRUSH relies on dashboard-based ordering and tracking, which has retention benefits, so guest checkout should not be copied without funnel evidence.",
    relatedCompetitorIds: ["socialwick"],
    socialRushPath: "/login",
    recommendedAction:
      "Track login-to-order abandonment and only simplify authentication if Phase 35 checkout data proves it is a material conversion blocker.",
  },
] as const;

export const competitorReviewWindowDays = 120;

export function competitorEvidenceAgeDays(reviewedAt: string, now = new Date()) {
  const reviewed = Date.parse(reviewedAt + "T00:00:00Z");
  if (!Number.isFinite(reviewed)) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.floor((now.getTime() - reviewed) / 86_400_000));
}

export function buildCompetitorIntelligenceSnapshot(now = new Date()) {
  const evidence = competitorProfiles.flatMap((competitor) =>
    competitor.evidence.map((item) => ({
      competitorId: competitor.id,
      competitorName: competitor.name,
      domain: competitor.domain,
      ...item,
      ageDays: competitorEvidenceAgeDays(item.reviewedAt, now),
      stale: competitorEvidenceAgeDays(item.reviewedAt, now) > competitorReviewWindowDays,
    })),
  );

  return {
    reviewedCompetitors: competitorProfiles.length,
    evidence,
    opportunities: [...competitiveOpportunities].sort((a, b) => b.priority - a.priority),
    summary: {
      evidenceItems: evidence.length,
      staleEvidence: evidence.filter((item) => item.stale).length,
      advantages: competitiveOpportunities.filter((item) => item.status === "socialrush-advantage").length,
      opportunities: competitiveOpportunities.filter((item) => item.status === "opportunity").length,
      parity: competitiveOpportunities.filter((item) => item.status === "parity").length,
    },
    note:
      "Competitor observations are internal research notes from competitor-owned public pages. They are not rankings, traffic estimates, quality guarantees or endorsements, and should be re-verified before external use.",
  };
}
