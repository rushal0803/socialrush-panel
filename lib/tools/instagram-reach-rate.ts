export type InstagramReachRateInputs = {
  followers: number;
  accountsReached: number;
  impressions?: number;
};

function safe(value: number) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateInstagramReachRate(input: InstagramReachRateInputs) {
  const followers = safe(input.followers);
  const accountsReached = safe(input.accountsReached);
  const impressions = safe(input.impressions ?? 0);

  if (followers <= 0 || accountsReached <= 0) return null;

  const reachRatePercent = (accountsReached / followers) * 100;
  const impressionsPerReachedAccount = impressions > 0 ? impressions / accountsReached : null;

  return {
    reachRatePercent: round(reachRatePercent),
    accountsReached: round(accountsReached),
    followers: round(followers),
    impressions: impressions > 0 ? round(impressions) : null,
    impressionsPerReachedAccount:
      impressionsPerReachedAccount === null ? null : round(impressionsPerReachedAccount),
  };
}
