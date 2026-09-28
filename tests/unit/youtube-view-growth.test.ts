import assert from "node:assert/strict";
import test from "node:test";
import { calculateYouTubeViewGrowth } from "../../lib/tools/youtube-view-growth.ts";

test("youtube view growth calculates period and 30-day pace", () => {
  assert.deepEqual(
    calculateYouTubeViewGrowth({
      startingViews: 100000,
      endingViews: 125000,
      days: 25,
      targetViews: 200000,
    }),
    {
      netChange: 25000,
      growthRatePercent: 25,
      dailyNetChange: 1000,
      monthlyNetChange: 30000,
      monthlyGrowthRatePercent: 30,
      remainingToTarget: 75000,
      daysToTarget: 75,
    },
  );
});

test("youtube view growth handles decline without inventing target timing", () => {
  const result = calculateYouTubeViewGrowth({
    startingViews: 100000,
    endingViews: 95000,
    days: 20,
    targetViews: 150000,
  });
  assert.equal(result?.growthRatePercent, -5);
  assert.equal(result?.dailyNetChange, -250);
  assert.equal(result?.daysToTarget, null);
});

test("youtube view growth reports an already reached target", () => {
  const result = calculateYouTubeViewGrowth({
    startingViews: 100000,
    endingViews: 150000,
    days: 30,
    targetViews: 150000,
  });
  assert.equal(result?.remainingToTarget, 0);
  assert.equal(result?.daysToTarget, 0);
});

test("youtube view growth rejects invalid starting count or duration", () => {
  assert.equal(calculateYouTubeViewGrowth({ startingViews: 0, endingViews: 100, days: 30 }), null);
  assert.equal(calculateYouTubeViewGrowth({ startingViews: 100, endingViews: 120, days: 0 }), null);
});
