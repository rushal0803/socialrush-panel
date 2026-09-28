export type YouTubeWatchTimeInputs = {
  views: number;
  averageViewDurationSeconds: number;
  targetWatchHours?: number;
};

function safe(value: number) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateYouTubeWatchTime(input: YouTubeWatchTimeInputs) {
  const views = safe(input.views);
  const averageViewDurationSeconds = safe(input.averageViewDurationSeconds);
  const targetWatchHours = safe(input.targetWatchHours ?? 0);

  if (views <= 0 || averageViewDurationSeconds <= 0) return null;

  const totalWatchSeconds = views * averageViewDurationSeconds;
  const totalWatchMinutes = totalWatchSeconds / 60;
  const totalWatchHours = totalWatchSeconds / 3600;
  const averageViewDurationMinutes = averageViewDurationSeconds / 60;

  const targetWatchSeconds = targetWatchHours > 0 ? targetWatchHours * 3600 : 0;
  const remainingWatchSeconds = targetWatchSeconds > 0
    ? Math.max(0, targetWatchSeconds - totalWatchSeconds)
    : 0;
  const additionalViewsNeeded = targetWatchSeconds > 0
    ? Math.ceil(remainingWatchSeconds / averageViewDurationSeconds)
    : null;
  const progressPercent = targetWatchSeconds > 0
    ? Math.min(100, (totalWatchSeconds / targetWatchSeconds) * 100)
    : null;

  return {
    totalWatchMinutes: round(totalWatchMinutes),
    totalWatchHours: round(totalWatchHours),
    averageViewDurationMinutes: round(averageViewDurationMinutes),
    additionalViewsNeeded,
    progressPercent: progressPercent === null ? null : round(progressPercent),
  };
}
