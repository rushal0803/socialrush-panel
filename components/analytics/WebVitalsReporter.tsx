"use client";

import { useReportWebVitals } from "next/web-vitals";
import { track } from "@/lib/analytics/events";

export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    const value = metric.name === "CLS"
      ? Number(metric.value.toFixed(4))
      : Math.round(metric.value);

    track("web_vital", {
      metric: metric.name,
      value,
    });
  });

  return null;
}
