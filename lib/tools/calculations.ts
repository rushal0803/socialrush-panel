export function safeNumber(value: number) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export function youtubeMetrics(subscribers: number, views: number, likes: number, comments: number) {
  const safeViews = safeNumber(views);
  const interactions = safeNumber(likes) + safeNumber(comments);
  return {
    interactions,
    engagementByViews: safeViews > 0 ? (interactions / safeViews) * 100 : null,
    viewsToSubscribers: safeNumber(subscribers) > 0 ? (safeViews / safeNumber(subscribers)) * 100 : null,
    likesToViews: safeViews > 0 ? (safeNumber(likes) / safeViews) * 100 : null,
  };
}

export function revenueEstimate(monthlyViews: number, lowRpm: number, highRpm: number) {
  const views = safeNumber(monthlyViews);
  const low = safeNumber(lowRpm);
  const high = Math.max(low, safeNumber(highRpm));
  return { low: (views / 1000) * low, high: (views / 1000) * high };
}
