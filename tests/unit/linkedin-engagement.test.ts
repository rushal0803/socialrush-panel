import assert from "node:assert/strict";
import test from "node:test";
import { calculateLinkedInEngagement } from "../../lib/tools/linkedin-engagement.ts";

test("linkedin engagement includes reactions comments reposts and optional clicks", () => {
  assert.deepEqual(calculateLinkedInEngagement({
    impressions: 8500,
    reactions: 148,
    comments: 26,
    reposts: 12,
    clicks: 95,
  }), {
    impressions: 8500,
    interactions: 281,
    engagementRate: 3.31,
    reactionRate: 1.74,
    commentRate: 0.31,
    repostRate: 0.14,
    clickRate: 1.12,
  });
});

test("linkedin engagement works without clicks", () => {
  const result = calculateLinkedInEngagement({
    impressions: 5000,
    reactions: 80,
    comments: 20,
    reposts: 10,
  });
  assert.equal(result?.interactions, 110);
  assert.equal(result?.engagementRate, 2.2);
  assert.equal(result?.clickRate, null);
});

test("linkedin engagement rejects zero impressions", () => {
  assert.equal(calculateLinkedInEngagement({
    impressions: 0,
    reactions: 10,
    comments: 2,
    reposts: 1,
    clicks: 5,
  }), null);
});

test("linkedin engagement clamps negative interaction inputs to zero", () => {
  const result = calculateLinkedInEngagement({
    impressions: 1000,
    reactions: -5,
    comments: 10,
    reposts: -2,
    clicks: 0,
  });
  assert.equal(result?.interactions, 10);
  assert.equal(result?.engagementRate, 1);
});
