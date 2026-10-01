export const instagramInformationServiceCodes = [
  "instagram-followers",
  "instagram-likes",
  "instagram-views",
  "instagram-comments",
  "instagram-saves",
  "instagram-shares",
] as const;

export type InstagramInformationServiceCode = (typeof instagramInformationServiceCodes)[number];

export type InstagramDecisionRow = {
  code: InstagramInformationServiceCode;
  label: string;
  href: string;
  bestFor: string;
  destination: string;
  visibleSignal: string;
  limitation: string;
};

export const instagramDecisionRows: readonly InstagramDecisionRow[] = [
  {
    code: "instagram-followers",
    label: "Followers",
    href: "/buy-instagram-followers-india",
    bestFor: "Profile-level social proof and a more established visible audience count.",
    destination: "Public Instagram profile URL",
    visibleSignal: "Follower count",
    limitation: "Does not guarantee likes, reach, sales, audience relevance, or organic engagement.",
  },
  {
    code: "instagram-likes",
    label: "Likes",
    href: "/instagram-likes",
    bestFor: "Visible engagement on one specific public post or Reel.",
    destination: "Public post or Reel URL",
    visibleSignal: "Like count",
    limitation: "Does not guarantee extra views, reach, followers, sales, or recommendations.",
  },
  {
    code: "instagram-views",
    label: "Views",
    href: "/instagram-views",
    bestFor: "Visible view count on eligible public Reels or video content.",
    destination: "Public Reel, post, or supported video URL",
    visibleSignal: "View count",
    limitation: "Does not guarantee likes, followers, recommendations, conversions, or virality.",
  },
  {
    code: "instagram-comments",
    label: "Comments",
    href: "/buy-instagram-comments-india",
    bestFor: "Visible comment activity on a specific public post or Reel.",
    destination: "Public post or Reel URL",
    visibleSignal: "Comment count",
    limitation: "Does not guarantee replies, ranking, reach, sales, or ongoing conversation.",
  },
  {
    code: "instagram-saves",
    label: "Saves",
    href: "/buy-instagram-saves-india",
    bestFor: "Visible save activity on eligible public posts and Reels.",
    destination: "Public post or Reel URL",
    visibleSignal: "Save activity",
    limitation: "Does not guarantee algorithmic distribution, reach, followers, conversions, or sales.",
  },
  {
    code: "instagram-shares",
    label: "Shares",
    href: "/buy-instagram-shares-india",
    bestFor: "Visible share activity on eligible public posts and Reels.",
    destination: "Public post or Reel URL",
    visibleSignal: "Share activity",
    limitation: "Does not guarantee organic distribution, additional reach, followers, conversions, or virality.",
  },
];

export function getInstagramDecisionRow(code: InstagramInformationServiceCode) {
  const row = instagramDecisionRows.find((item) => item.code === code);
  if (!row) throw new Error(`Unknown Instagram information service: ${code}`);
  return row;
}

export function buildInstagramQuantityExamples(
  ratePer1000: number | null | undefined,
  minQuantity?: number | null,
  maxQuantity?: number | null,
) {
  if (!Number.isFinite(ratePer1000) || Number(ratePer1000) <= 0) return [];
  const min = Number.isFinite(minQuantity) && Number(minQuantity) > 0 ? Number(minQuantity) : 0;
  const max = Number.isFinite(maxQuantity) && Number(maxQuantity) > 0 ? Number(maxQuantity) : Number.POSITIVE_INFINITY;
  return [1000, 5000, 10000]
    .filter((quantity) => quantity >= min && quantity <= max)
    .map((quantity) => ({
      quantity,
      total: Math.round((quantity * Number(ratePer1000)) / 1000 * 100) / 100,
    }));
}
