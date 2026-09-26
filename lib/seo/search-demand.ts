export type QuantityPlanningRow = {
  quantity: number;
  total: number;
};

export function buildQuantityPlanning(pricePer1000: number | null, quantities: readonly number[] = [1000, 5000, 10000]) {
  if (pricePer1000 === null || !Number.isFinite(pricePer1000) || pricePer1000 <= 0) return [];
  return quantities
    .filter((quantity) => Number.isInteger(quantity) && quantity > 0)
    .map((quantity) => ({
      quantity,
      total: Math.round(((pricePer1000 * quantity) / 1000) * 100) / 100,
    }));
}

export function serviceUnitFromCode(serviceCode: string) {
  const unit = serviceCode.split("-").pop() || "units";
  const labels: Record<string,string> = {
    followers: "followers",
    subscribers: "subscribers",
    members: "members",
    likes: "likes",
    views: "views",
    comments: "comments",
    saves: "saves",
    shares: "shares",
    retweets: "retweets",
    reactions: "reactions",
    votes: "votes",
  };
  return labels[unit] || unit;
}
