import assert from "node:assert/strict";
import test from "node:test";
import { calculateSocialAdMetrics } from "../../lib/tools/social-ad-metrics.ts";

test("social ad metrics calculate CPM CPC CTR and funnel costs transparently", () => {
  assert.deepEqual(
    calculateSocialAdMetrics({
      spend: 25000,
      impressions: 500000,
      clicks: 7500,
      leads: 420,
      conversions: 63,
    }),
    {
      spend: 25000,
      impressions: 500000,
      clicks: 7500,
      leads: 420,
      conversions: 63,
      cpm: 50,
      cpc: 3.33,
      ctrPercent: 1.5,
      cpl: 59.52,
      cpa: 396.83,
      clickToLeadRatePercent: 5.6,
      leadToConversionRatePercent: 15,
    },
  );
});

test("social ad metrics return null where a denominator is unavailable", () => {
  const result = calculateSocialAdMetrics({
    spend: 1000,
    impressions: 0,
    clicks: 0,
    leads: 0,
    conversions: 0,
  });

  assert.equal(result.cpm, null);
  assert.equal(result.cpc, null);
  assert.equal(result.ctrPercent, null);
  assert.equal(result.cpl, null);
  assert.equal(result.cpa, null);
  assert.equal(result.clickToLeadRatePercent, null);
  assert.equal(result.leadToConversionRatePercent, null);
});

test("social ad metrics clamp invalid negative inputs to zero", () => {
  const result = calculateSocialAdMetrics({
    spend: -100,
    impressions: -5000,
    clicks: -10,
    leads: -3,
    conversions: Number.NaN,
  });

  assert.equal(result.spend, 0);
  assert.equal(result.impressions, 0);
  assert.equal(result.clicks, 0);
  assert.equal(result.leads, 0);
  assert.equal(result.conversions, 0);
});
