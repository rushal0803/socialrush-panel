import assert from "node:assert/strict";
import test from "node:test";
import { calculateInstagramStoryEngagement } from "../../lib/tools/instagram-story-engagement.ts";

test("instagram story engagement calculates total interaction rate and component rates", () => {
  assert.deepEqual(
    calculateInstagramStoryEngagement({
      views: 5000,
      replies: 25,
      stickerTaps: 80,
      linkClicks: 60,
      profileVisits: 40,
    }),
    {
      totalInteractions: 205,
      interactionRatePercent: 4.1,
      replyRatePercent: 0.5,
      stickerTapRatePercent: 1.6,
      linkClickRatePercent: 1.2,
      profileVisitRatePercent: 0.8,
    },
  );
});

test("instagram story engagement allows zero optional interactions", () => {
  assert.deepEqual(
    calculateInstagramStoryEngagement({ views: 1000 }),
    {
      totalInteractions: 0,
      interactionRatePercent: 0,
      replyRatePercent: 0,
      stickerTapRatePercent: 0,
      linkClickRatePercent: 0,
      profileVisitRatePercent: 0,
    },
  );
});

test("instagram story engagement rejects missing or invalid view denominator", () => {
  assert.equal(calculateInstagramStoryEngagement({ views: 0, replies: 10 }), null);
  assert.equal(calculateInstagramStoryEngagement({ views: -10, replies: 10 }), null);
});
