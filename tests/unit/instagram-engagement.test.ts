import assert from "node:assert/strict";
import test from "node:test";
import { calculateInstagramEngagement } from "../../lib/tools/instagram-engagement.ts";

test("post engagement calculates interaction and component rates", () => {
  assert.deepEqual(
    calculateInstagramEngagement({
      mode: "post",
      basis: "followers",
      audience: 10000,
      likes: 500,
      comments: 50,
      saves: 25,
      shares: 25,
    }),
    {
      mode: "post",
      basis: "followers",
      interactions: 600,
      engagementRate: 6,
      likeRate: 5,
      commentRate: 0.5,
      saveRate: 0.25,
      shareRate: 0.25,
      reelPlayEngagementRate: null,
    },
  );
});

test("reel engagement calculates optional interactions per play", () => {
  const result = calculateInstagramEngagement({
    mode: "reel",
    basis: "reach",
    audience: 12500,
    likes: 520,
    comments: 44,
    saves: 30,
    shares: 56,
    plays: 18000,
  });
  assert.equal(result?.engagementRate, 5.2);
  assert.equal(result?.reelPlayEngagementRate, 650 / 18000 * 100);
});

test("reel play rate is omitted when plays are not supplied", () => {
  const result = calculateInstagramEngagement({
    mode: "reel",
    basis: "followers",
    audience: 5000,
    likes: 100,
    comments: 20,
    saves: 10,
    shares: 5,
  });
  assert.equal(result?.reelPlayEngagementRate, null);
});

test("instagram engagement rejects a zero denominator", () => {
  assert.equal(calculateInstagramEngagement({
    mode: "post",
    basis: "reach",
    audience: 0,
    likes: 10,
    comments: 2,
    saves: 1,
    shares: 1,
  }), null);
});
