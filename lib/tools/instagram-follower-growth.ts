export type InstagramFollowerGrowthInputs = {
  startingFollowers: number;
  endingFollowers: number;
  days: number;
  targetFollowers?: number;
};

function safe(value: number) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateInstagramFollowerGrowth(input: InstagramFollowerGrowthInputs) {
  const startingFollowers = safe(input.startingFollowers);
  const endingFollowers = safe(input.endingFollowers);
  const days = safe(input.days);
  const targetFollowers = safe(input.targetFollowers ?? 0);

  if (startingFollowers <= 0 || endingFollowers < 0 || days <= 0) return null;

  const netChange = endingFollowers - startingFollowers;
  const growthRatePercent = (netChange / startingFollowers) * 100;
  const dailyNetChange = netChange / days;
  const monthlyNetChange = dailyNetChange * 30;
  const monthlyGrowthRatePercent = (monthlyNetChange / startingFollowers) * 100;

  const remainingToTarget = targetFollowers > 0
    ? Math.max(0, targetFollowers - endingFollowers)
    : null;

  const daysToTarget = targetFollowers > endingFollowers && dailyNetChange > 0
    ? Math.ceil((targetFollowers - endingFollowers) / dailyNetChange)
    : targetFollowers > 0 && targetFollowers <= endingFollowers
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
