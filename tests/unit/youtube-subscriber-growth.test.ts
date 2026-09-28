import assert from "node:assert/strict";
import test from "node:test";
import { calculateYouTubeSubscriberGrowth } from "../../lib/tools/youtube-subscriber-growth.ts";

test("youtube subscriber growth calculates period and 30-day pace", () => {
  assert.deepEqual(
    calculateYouTubeSubscriberGrowth({
      startingSubscribers: 5000,
      endingSubscribers: 5600,
      days: 30,
      targetSubscribers: 10000,
    }),
    {
      netChange: 600,
      growthRatePercent: 12,
      dailyNetChange: 20,
      monthlyNetChange: 600,
      monthlyGrowthRatePercent: 12,
      remainingToTarget: 4400,
      daysToTarget: 220,
    },
  );
});

test("youtube subscriber growth handles decline without inventing target timing", () => {
  const result = calculateYouTubeSubscriberGrowth({
    startingSubscribers: 5000,
    endingSubscribers: 4750,
    days: 30,
    targetSubscribers: 6000,
  });
  assert.equal(result?.growthRatePercent, -5);
  assert.equal(result?.monthlyNetChange, -250);
  assert.equal(result?.daysToTarget, null);
});

test("youtube subscriber growth reports an already reached target", () => {
  const result = calculateYouTubeSubscriberGrowth({
    startingSubscribers: 9000,
    endingSubscribers: 10000,
    days: 20,
    targetSubscribers: 10000,
  });
  assert.equal(result?.remainingToTarget, 0);
  assert.equal(result?.daysToTarget, 0);
});

test("youtube subscriber growth rejects invalid starting count or duration", () => {
  assert.equal(calculateYouTubeSubscriberGrowth({ startingSubscribers: 0, endingSubscribers: 100, days: 30 }), null);
  assert.equal(calculateYouTubeSubscriberGrowth({ startingSubscribers: 100, endingSubscribers: 120, days: 0 }), null);
});
