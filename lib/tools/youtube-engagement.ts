export type YouTubeEngagementMode = "video" | "shorts";

export type YouTubeEngagementInput = {
  mode: YouTubeEngagementMode;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  subscribers?: number;
  engagedViews?: number;
};

function safe(value: number | undefined) {
  return Number.isFinite(value) && Number(value) >= 0 ? Number(value) : 0;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateYouTubeEngagement(input: YouTubeEngagementInput) {
  const views = safe(input.views);
  if (views <= 0) return null;

  const likes = safe(input.likes);
  const comments = safe(input.comments);
  const shares = safe(input.shares);
  const subscribers = safe(input.subscribers);
  const engagedViews = safe(input.engagedViews);
  const interactions = likes + comments + shares;

  return {
    mode: input.mode,
    interactions,
    engagementRate: round((interactions / views) * 100),
    likeRate: round((likes / views) * 100),
    commentRate: round((comments / views) * 100),
    shareRate: round((shares / views) * 100),
    viewsToSubscribers: subscribers > 0 ? round((views / subscribers) * 100) : null,
    engagedViewRate:
      input.mode === "shorts" && engagedViews > 0
        ? round((engagedViews / views) * 100)
        : null,
  };
}
