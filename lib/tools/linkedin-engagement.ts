export type LinkedInEngagementInput = {
  impressions: number;
  reactions: number;
  comments: number;
  reposts: number;
  clicks?: number;
};

function safe(value: number | undefined) {
  return Number.isFinite(value) && Number(value) >= 0 ? Number(value) : 0;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateLinkedInEngagement(input: LinkedInEngagementInput) {
  const impressions = safe(input.impressions);
  if (impressions <= 0) return null;

  const reactions = safe(input.reactions);
  const comments = safe(input.comments);
  const reposts = safe(input.reposts);
  const clicks = safe(input.clicks);
  const interactions = reactions + comments + reposts + clicks;

  return {
    impressions,
    interactions,
    engagementRate: round((interactions / impressions) * 100),
    reactionRate: round((reactions / impressions) * 100),
    commentRate: round((comments / impressions) * 100),
    repostRate: round((reposts / impressions) * 100),
    clickRate: clicks > 0 ? round((clicks / impressions) * 100) : null,
  };
}
