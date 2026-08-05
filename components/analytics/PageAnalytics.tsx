"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track, type ClientAnalyticsEvent } from "@/lib/analytics/events";

export default function PageAnalytics() {
  const path = usePathname();

  useEffect(() => {
    let event: ClientAnalyticsEvent | null = null;
    if (path.startsWith("/blog/")) event = "blog_article_viewed";
    if (event) track(event);
  }, [path]);

  return null;
}
