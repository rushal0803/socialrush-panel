"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track, type ClientAnalyticsEvent } from "@/lib/analytics/events";

type VitalName = "LCP" | "CLS" | "INP";

function rating(name: VitalName, value: number) {
  const good = name === "LCP" ? 2500 : name === "CLS" ? 0.1 : 200;
  const needsImprovement = name === "LCP" ? 4000 : name === "CLS" ? 0.25 : 500;
  return value <= good ? "good" : value <= needsImprovement ? "needs_improvement" : "poor";
}

export default function PageAnalytics() {
  const path = usePathname();

  useEffect(() => {
    let event: ClientAnalyticsEvent | null = null;
    if (path === "/") event = "homepage_view";
    else if (path === "/services") event = "services_page_view";
    else if (path === "/packages") event = "packages_page_view";
    else if (path === "/dashboard/new-order") event = "new_order_started";
    else if (/^\/(buy-|instagram-|youtube-|facebook-|linkedin-|telegram-|tiktok-|twitter-)|^\/services\//.test(path)) event = "service_landing_page_view";
    if (event) track(event);
  }, [path]);

  useEffect(() => {
    if (!("PerformanceObserver" in window)) return;
    const reported = new Set<VitalName>();
    const report = (name: VitalName, value: number) => {
      if (reported.has(name) || !Number.isFinite(value)) return;
      reported.add(name);
      track("web_vital", { metric: name, value: Math.round(value * 100) / 100, rating: rating(name, value) });
    };
    const observers: PerformanceObserver[] = [];
    let lcpValue = 0;
    let clsValue = 0;
    let inpValue = 0;
    const flush = () => {
      if (lcpValue) report("LCP", lcpValue);
      report("CLS", clsValue);
      if (inpValue) report("INP", inpValue);
    };
    const onVisibilityChange = () => { if (document.visibilityState === "hidden") flush(); };
    try {
      const lcp = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const entry = entries[entries.length - 1] as PerformanceEntry & { startTime: number } | undefined;
        if (entry) lcpValue = entry.startTime;
      });
      lcp.observe({ type: "largest-contentful-paint", buffered: true });
      observers.push(lcp);
      const cls = new PerformanceObserver((list) => {
        clsValue += list.getEntries().reduce((total, entry) => total + ((entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean }).hadRecentInput ? 0 : (entry as PerformanceEntry & { value?: number }).value || 0), 0);
      });
      cls.observe({ type: "layout-shift", buffered: true });
      observers.push(cls);
      const inp = new PerformanceObserver((list) => {
        const entries = list.getEntries() as Array<PerformanceEntry & { duration?: number }>;
        const entry = entries.reduce((slowest, current) => (current.duration || 0) > (slowest?.duration || 0) ? current : slowest, entries[0]);
        if (entry?.duration) inpValue = Math.max(inpValue, entry.duration);
      });
      inp.observe({ type: "event", buffered: true, durationThreshold: 40 } as PerformanceObserverInit);
      observers.push(inp);
    } catch { /* Unsupported browser entries are optional monitoring only. */ }
    addEventListener("visibilitychange", onVisibilityChange);
    addEventListener("pagehide", flush, { once: true });
    return () => {
      flush();
      removeEventListener("visibilitychange", onVisibilityChange);
      removeEventListener("pagehide", flush);
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return null;
}
