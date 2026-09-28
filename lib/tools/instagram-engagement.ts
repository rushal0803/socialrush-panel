export type InstagramEngagementMode = "post" | "reel";
export type InstagramEngagementBasis = "followers" | "reach";

export type InstagramEngagementInput = {
  mode: InstagramEngagementMode;
  basis: InstagramEngagementBasis;
  audience: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  plays?: number;
};

export type InstagramEngagementResult = {
  mode: InstagramEngagementMode;
  basis: InstagramEngagementBasis;
  interactions: number;
  engagementRate: number;
  likeRate: number;
  commentRate: number;
  saveRate: number;
  shareRate: number;
  reelPlayEngagementRate: number | null;
};

function safe(value: number) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function percentage(part: number, whole: number) {
  return whole > 0 ? (part / whole) * 100 : 0;
}

export function calculateInstagramEngagement(input: InstagramEngagementInput): InstagramEngagementResult | null {
  const audience = safe(input.audience);
  if (audience <= 0) return null;

  const likes = safe(input.likes);
  const comments = safe(input.comments);
  const saves = safe(input.saves);
  const shares = safe(input.shares);
  const interactions = likes + comments + saves + shares;
  const plays = safe(input.plays ?? 0);

  return {
    mode: input.mode,
    basis: input.basis,
    interactions,
    engagementRate: percentage(interactions, audience),
    likeRate: percentage(likes, audience),
    commentRate: percentage(comments, audience),
    saveRate: percentage(saves, audience),
    shareRate: percentage(shares, audience),
    reelPlayEngagementRate: input.mode === "reel" && plays > 0 ? percentage(interactions, plays) : null,
  };
}
