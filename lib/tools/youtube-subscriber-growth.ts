export type YouTubeSubscriberGrowthInputs = {
  startingSubscribers: number;
  endingSubscribers: number;
  days: number;
  targetSubscribers?: number;
};

function safe(value: number) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateYouTubeSubscriberGrowth(input: YouTubeSubscriberGrowthInputs) {
  const startingSubscribers = safe(input.startingSubscribers);
  const endingSubscribers = safe(input.endingSubscribers);
  const days = safe(input.days);
  const targetSubscribers = safe(input.targetSubscribers ?? 0);

  if (startingSubscribers <= 0 || endingSubscribers < 0 || days <= 0) return null;

  const netChange = endingSubscribers - startingSubscribers;
  const growthRatePercent = (netChange / startingSubscribers) * 100;
  const dailyNetChange = netChange / days;
  const monthlyNetChange = dailyNetChange * 30;
  const monthlyGrowthRatePercent = (monthlyNetChange / startingSubscribers) * 100;

  const remainingToTarget = targetSubscribers > 0
    ? Math.max(0, targetSubscribers - endingSubscribers)
    : null;

  const daysToTarget = targetSubscribers > endingSubscribers && dailyNetChange > 0
    ? Math.ceil((targetSubscribers - endingSubscribers) / dailyNetChange)
    : targetSubscribers > 0 && targetSubscribers <= endingSubscribers
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
