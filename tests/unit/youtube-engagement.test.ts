import assert from "node:assert/strict";
import test from "node:test";
import { calculateYouTubeEngagement } from "../../lib/tools/youtube-engagement.ts";

test("video engagement includes likes comments and shares", () => {
  assert.deepEqual(
    calculateYouTubeEngagement({
      mode: "video",
      views: 10000,
      likes: 500,
      comments: 50,
      shares: 25,
      subscribers: 2000,
    }),
    {
      mode: "video",
      interactions: 575,
      engagementRate: 5.75,
      likeRate: 5,
      commentRate: 0.5,
      shareRate: 0.25,
      viewsToSubscribers: 500,
      engagedViewRate: null,
    },
  );
});

test("shorts mode calculates optional engaged-view rate", () => {
  const result = calculateYouTubeEngagement({
    mode: "shorts",
    views: 25000,
    likes: 1200,
    comments: 100,
    shares: 200,
    engagedViews: 17500,
  });
  assert.equal(result?.engagementRate, 6);
  assert.equal(result?.engagedViewRate, 70);
  assert.equal(result?.viewsToSubscribers, null);
});

test("engaged-view rate is not emitted for regular video mode", () => {
  const result = calculateYouTubeEngagement({
    mode: "video",
    views: 1000,
    likes: 50,
    comments: 10,
    shares: 5,
    engagedViews: 800,
  });
  assert.equal(result?.engagedViewRate, null);
});

test("youtube engagement rejects a zero view denominator", () => {
  assert.equal(calculateYouTubeEngagement({
    mode: "shorts",
    views: 0,
    likes: 10,
    comments: 2,
    shares: 1,
  }), null);
});
