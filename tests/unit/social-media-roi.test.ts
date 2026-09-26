import assert from "node:assert/strict";
import test from "node:test";
import { calculateSocialMediaRoi } from "../../lib/tools/social-media-roi.ts";

test("social media ROI uses gross profit rather than treating all revenue as profit", () => {
  const result = calculateSocialMediaRoi({
    revenue: 120000,
    grossMarginPercent: 60,
    adSpend: 25000,
    contentCost: 12000,
    toolsCost: 3000,
    laborCost: 15000,
    otherCost: 0,
    leads: 180,
    conversions: 24,
  });

  assert.deepEqual(result, {
    totalInvestment: 55000,
    grossProfitBeforeCampaignCost: 72000,
    contributionAfterListedCosts: 17000,
    roiPercent: 30.91,
    returnMultiple: 1.31,
    revenueRoas: 4.8,
    costPerLead: 305.56,
    costPerConversion: 2291.67,
    breakEvenRevenue: 91666.67,
  });
});

test("social media ROI can show a negative return without hiding the loss", () => {
  const result = calculateSocialMediaRoi({
    revenue: 50000,
    grossMarginPercent: 50,
    adSpend: 20000,
    contentCost: 10000,
    toolsCost: 5000,
    laborCost: 5000,
    otherCost: 0,
    leads: 0,
    conversions: 0,
  });

  assert.equal(result?.totalInvestment, 40000);
  assert.equal(result?.grossProfitBeforeCampaignCost, 25000);
  assert.equal(result?.contributionAfterListedCosts, -15000);
  assert.equal(result?.roiPercent, -37.5);
  assert.equal(result?.costPerLead, null);
  assert.equal(result?.costPerConversion, null);
});

test("social media ROI refuses a meaningless zero-cost denominator", () => {
  assert.equal(
    calculateSocialMediaRoi({
      revenue: 100000,
      grossMarginPercent: 60,
      adSpend: 0,
      contentCost: 0,
      toolsCost: 0,
      laborCost: 0,
      otherCost: 0,
      leads: 10,
      conversions: 2,
    }),
    null,
  );
});

test("social media ROI caps impossible gross margin inputs at 100 percent", () => {
  const result = calculateSocialMediaRoi({
    revenue: 10000,
    grossMarginPercent: 150,
    adSpend: 5000,
    contentCost: 0,
    toolsCost: 0,
    laborCost: 0,
    otherCost: 0,
    leads: 0,
    conversions: 0,
  });

  assert.equal(result?.grossProfitBeforeCampaignCost, 10000);
  assert.equal(result?.roiPercent, 100);
});
