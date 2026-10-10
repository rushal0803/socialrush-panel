"use client";

import { useReportWebVitals } from "next/web-vitals";
import { track } from "@/lib/analytics/events";
import { webVitalNavigationType, webVitalPageTemplate, webVitalReleaseId } from "@/lib/analytics/web-vital-dimensions";

// NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA is Vercel's public, build-specific git SHA.
// Leave this as "unknown" when the system variable is unavailable locally.
const releaseId = webVitalReleaseId(process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA);

export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    const value = metric.name === "CLS"
      ? Number(metric.value.toFixed(4))
      : Math.round(metric.value);
    track("web_vital", {
      metric: metric.name,
      value,
      release: releaseId,
      page_template: webVitalPageTemplate(window.location.pathname),
      navigation_type: webVitalNavigationType("navigationType" in metric ? metric.navigationType : undefined),
    });
  });

  return null;
}
