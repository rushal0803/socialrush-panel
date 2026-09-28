export type YouTubeViewGrowthInputs = {
  startingViews: number;
  endingViews: number;
  days: number;
  targetViews?: number;
};

function safe(value: number) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateYouTubeViewGrowth(input: YouTubeViewGrowthInputs) {
  const startingViews = safe(input.startingViews);
  const endingViews = safe(input.endingViews);
  const days = safe(input.days);
  const targetViews = safe(input.targetViews ?? 0);

  if (startingViews <= 0 || endingViews < 0 || days <= 0) return null;

  const netChange = endingViews - startingViews;
  const growthRatePercent = (netChange / startingViews) * 100;
  const dailyNetChange = netChange / days;
  const monthlyNetChange = dailyNetChange * 30;
  const monthlyGrowthRatePercent = (monthlyNetChange / startingViews) * 100;

  const remainingToTarget = targetViews > 0
    ? Math.max(0, targetViews - endingViews)
    : null;

  const daysToTarget = targetViews > endingViews && dailyNetChange > 0
    ? Math.ceil((targetViews - endingViews) / dailyNetChange)
    : targetViews > 0 && targetViews <= endingViews
      ? 0
      : null;

  return {
    netChange: round(netChange),
    growthRatePercent: round(growthRatePercent),
    dailyNetChange: round(dailyNetChange),
    monthlyNetChange: round(monthlyNetChange),
    monthlyGrowthRatePercent: round(monthlyGrowthRatePercent),
    remainingToTarget,
    daysToTarget,
  };
}
