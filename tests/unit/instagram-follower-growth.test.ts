import assert from "node:assert/strict";
import test from "node:test";
import { calculateInstagramFollowerGrowth } from "../../lib/tools/instagram-follower-growth.ts";

test("instagram follower growth calculates period and 30-day pace", () => {
  assert.deepEqual(
    calculateInstagramFollowerGrowth({
      startingFollowers: 10000,
      endingFollowers: 10800,
      days: 30,
      targetFollowers: 25000,
    }),
    {
      netChange: 800,
      growthRatePercent: 8,
      dailyNetChange: 26.67,
      monthlyNetChange: 800,
      monthlyGrowthRatePercent: 8,
      remainingToTarget: 14200,
      daysToTarget: 533,
    },
  );
});

test("instagram follower growth handles decline without inventing target timing", () => {
  const result = calculateInstagramFollowerGrowth({
    startingFollowers: 10000,
    endingFollowers: 9500,
    days: 30,
    targetFollowers: 12000,
  });
  assert.equal(result?.growthRatePercent, -5);
  assert.equal(result?.monthlyNetChange, -500);
  assert.equal(result?.daysToTarget, null);
});

test("instagram follower growth reports an already reached target", () => {
  const result = calculateInstagramFollowerGrowth({
    startingFollowers: 9000,
    endingFollowers: 10000,
    days: 20,
    targetFollowers: 10000,
  });
  assert.equal(result?.remainingToTarget, 0);
  assert.equal(result?.daysToTarget, 0);
});

test("instagram follower growth rejects invalid starting count or duration", () => {
  assert.equal(calculateInstagramFollowerGrowth({ startingFollowers: 0, endingFollowers: 100, days: 30 }), null);
  assert.equal(calculateInstagramFollowerGrowth({ startingFollowers: 100, endingFollowers: 120, days: 0 }), null);
});
