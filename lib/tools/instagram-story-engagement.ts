export type InstagramStoryEngagementInputs = {
  views: number;
  replies?: number;
  stickerTaps?: number;
  linkClicks?: number;
  profileVisits?: number;
};

function safe(value: number | undefined) {
  return Number.isFinite(value) && (value ?? 0) >= 0 ? Number(value ?? 0) : 0;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateInstagramStoryEngagement(input: InstagramStoryEngagementInputs) {
  const views = safe(input.views);
  if (views <= 0) return null;

  const replies = safe(input.replies);
  const stickerTaps = safe(input.stickerTaps);
  const linkClicks = safe(input.linkClicks);
  const profileVisits = safe(input.profileVisits);
  const totalInteractions = replies + stickerTaps + linkClicks + profileVisits;

  return {
    totalInteractions,
    interactionRatePercent: round((totalInteractions / views) * 100),
    replyRatePercent: round((replies / views) * 100),
    stickerTapRatePercent: round((stickerTaps / views) * 100),
    linkClickRatePercent: round((linkClicks / views) * 100),
    profileVisitRatePercent: round((profileVisits / views) * 100),
  };
}
