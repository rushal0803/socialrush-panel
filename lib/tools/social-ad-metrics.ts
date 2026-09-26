export type SocialAdMetricInputs = {
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  conversions: number;
};

function safe(value: number) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateSocialAdMetrics(input: SocialAdMetricInputs) {
  const spend = safe(input.spend);
  const impressions = safe(input.impressions);
  const clicks = safe(input.clicks);
  const leads = safe(input.leads);
  const conversions = safe(input.conversions);

  return {
    spend: round(spend),
    impressions: Math.round(impressions),
    clicks: Math.round(clicks),
    leads: Math.round(leads),
    conversions: Math.round(conversions),
    cpm: impressions > 0 ? round((spend / impressions) * 1000) : null,
    cpc: clicks > 0 ? round(spend / clicks) : null,
    ctrPercent: impressions > 0 ? round((clicks / impressions) * 100) : null,
    cpl: leads > 0 ? round(spend / leads) : null,
    cpa: conversions > 0 ? round(spend / conversions) : null,
    clickToLeadRatePercent: clicks > 0 ? round((leads / clicks) * 100) : null,
    leadToConversionRatePercent: leads > 0 ? round((conversions / leads) * 100) : null,
  };
}
