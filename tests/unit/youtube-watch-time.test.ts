import assert from "node:assert/strict";
import test from "node:test";
import { calculateYouTubeWatchTime } from "../../lib/tools/youtube-watch-time.ts";

test("youtube watch time converts views and average view duration into hours", () => {
  assert.deepEqual(
    calculateYouTubeWatchTime({
      views: 25000,
      averageViewDurationSeconds: 270,
      targetWatchHours: 4000,
    }),
    {
      totalWatchMinutes: 112500,
      totalWatchHours: 1875,
      averageViewDurationMinutes: 4.5,
      additionalViewsNeeded: 28334,
      progressPercent: 46.88,
    },
  );
});

test("youtube watch time allows calculation without a target", () => {
  const result = calculateYouTubeWatchTime({
    views: 1000,
    averageViewDurationSeconds: 180,
  });
  assert.equal(result?.totalWatchHours, 50);
  assert.equal(result?.additionalViewsNeeded, null);
  assert.equal(result?.progressPercent, null);
});

test("youtube watch time refuses zero denominating duration", () => {
  assert.equal(
    calculateYouTubeWatchTime({
      views: 1000,
      averageViewDurationSeconds: 0,
      targetWatchHours: 100,
    }),
    null,
  );
});

test("youtube watch time clamps negative user input safely", () => {
  assert.equal(
    calculateYouTubeWatchTime({
      views: -100,
      averageViewDurationSeconds: 180,
      targetWatchHours: 100,
    }),
    null,
  );
});
