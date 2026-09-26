export type SocialMediaRoiInputs = {
  revenue: number;
  grossMarginPercent: number;
  adSpend: number;
  contentCost: number;
  toolsCost: number;
  laborCost: number;
  otherCost: number;
  leads: number;
  conversions: number;
};

function safe(value: number) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateSocialMediaRoi(input: SocialMediaRoiInputs) {
  const revenue = safe(input.revenue);
  const grossMarginPercent = Math.min(100, safe(input.grossMarginPercent));
  const totalInvestment =
    safe(input.adSpend) +
    safe(input.contentCost) +
    safe(input.toolsCost) +
    safe(input.laborCost) +
    safe(input.otherCost);

  if (totalInvestment <= 0 || grossMarginPercent <= 0) return null;

  const grossProfitBeforeCampaignCost = revenue * (grossMarginPercent / 100);
  const contributionAfterListedCosts = grossProfitBeforeCampaignCost - totalInvestment;
  const roiPercent = (contributionAfterListedCosts / totalInvestment) * 100;
  const leads = safe(input.leads);
  const conversions = safe(input.conversions);
  const adSpend = safe(input.adSpend);

  return {
    totalInvestment: round(totalInvestment),
    grossProfitBeforeCampaignCost: round(grossProfitBeforeCampaignCost),
    contributionAfterListedCosts: round(contributionAfterListedCosts),
    roiPercent: round(roiPercent),
    returnMultiple: round(grossProfitBeforeCampaignCost / totalInvestment),
    revenueRoas: adSpend > 0 ? round(revenue / adSpend) : null,
    costPerLead: leads > 0 ? round(totalInvestment / leads) : null,
    costPerConversion: conversions > 0 ? round(totalInvestment / conversions) : null,
    breakEvenRevenue: round(totalInvestment / (grossMarginPercent / 100)),
  };
}
