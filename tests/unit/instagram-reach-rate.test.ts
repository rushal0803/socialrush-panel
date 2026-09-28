import assert from "node:assert/strict";
import test from "node:test";
import { calculateInstagramReachRate } from "../../lib/tools/instagram-reach-rate.ts";

test("instagram reach rate calculates reach against followers", () => {
  assert.deepEqual(
    calculateInstagramReachRate({ followers: 10000, accountsReached: 12500 }),
    {
      reachRatePercent: 125,
      accountsReached: 12500,
      followers: 10000,
      impressions: null,
      impressionsPerReachedAccount: null,
    },
  );
});

test("instagram reach rate calculates impression frequency when supplied", () => {
  const result = calculateInstagramReachRate({
    followers: 10000,
    accountsReached: 12500,
    impressions: 18000,
  });
  assert.equal(result?.reachRatePercent, 125);
  assert.equal(result?.impressionsPerReachedAccount, 1.44);
});

test("instagram reach rate rejects missing denominator or reach", () => {
  assert.equal(calculateInstagramReachRate({ followers: 0, accountsReached: 1000 }), null);
  assert.equal(calculateInstagramReachRate({ followers: 1000, accountsReached: 0 }), null);
});

test("instagram reach rate safely ignores negative optional impressions", () => {
  const result = calculateInstagramReachRate({
    followers: 1000,
    accountsReached: 500,
    impressions: -100,
  });
  assert.equal(result?.reachRatePercent, 50);
  assert.equal(result?.impressions, null);
  assert.equal(result?.impressionsPerReachedAccount, null);
});
