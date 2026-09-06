"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track, type ClientAnalyticsEvent } from "@/lib/analytics/events";

export default function PageAnalytics() {
  const path = usePathname();

  useEffect(() => {
    let event: ClientAnalyticsEvent | null = null;
    if (path.startsWith("/blog/")) event = "blog_article_viewed";
    const market = path.match(/^\/(us|uk|ca|au|ae|sg)$/)?.[1];
    if (market) track("market_hub_viewed", { market, country_page_type: "hub" });
    if (event) track(event);
    // Record the landing type only. Referrer URLs and search terms are never sent.
    const referrerHost = (() => {
      try { return document.referrer ? new URL(document.referrer).hostname : ""; } catch { return ""; }
    })();
    if (/(google|bing|duckduckgo|yahoo|yandex|baidu)\./i.test(referrerHost)) {
      track("organic_landing_view", { referrer_type: "search" });
    }
  }, [path]);

  return null;
}
