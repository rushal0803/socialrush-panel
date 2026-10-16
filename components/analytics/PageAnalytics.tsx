"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { isOrganicSearchReferrer, isPublicOrganicLandingPath, primeAttribution, track, type ClientAnalyticsEvent } from "@/lib/analytics/events";

export default function PageAnalytics() {
  const path = usePathname();
  const checkedInitialLanding = useRef(false);

  useEffect(() => {
    primeAttribution();
    track("page_viewed");
    let event: ClientAnalyticsEvent | null = null;
    if (path.startsWith("/blog/")) event = "blog_article_viewed";
    const market = path.match(/^\/(us|uk|ca|au|ae|sg)$/)?.[1];
    if (market) track("market_hub_viewed", { market, country_page_type: "hub" });
    if (event) track(event);
    // The document referrer remains unchanged during client-side navigation.
    // Count one search landing per document, not again on dashboard/route changes.
    // Referrer URLs and search terms are never sent.
    if (!checkedInitialLanding.current) {
      checkedInitialLanding.current = true;
      if (isOrganicSearchReferrer(document.referrer, window.location.hostname) && isPublicOrganicLandingPath(path)) {
        track("organic_landing_view", { referrer_type: "search" });
      }
    }
  }, [path]);

  return null;
}
