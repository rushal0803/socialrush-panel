export const MONTHLY_TRAFFIC_TARGET = 100_000;

export type TrafficSourceRow = {
  source: string;
  medium: string;
  visitors: number;
};

export type TrafficLandingRow = {
  path: string;
  visitors: number;
};

export type TrafficCampaignRow = {
  campaign: string;
  source: string;
  visitors: number;
};

export type TrafficDailyRow = {
  date: string;
  visitors: number;
};

export type TrafficSnapshot = {
  window_days: number;
  current_visitors: number;
  previous_visitors: number;
  page_views: number;
  page_view_visitors: number;
  organic_visitors: number;
  attributed_visitors: number;
  organic_landing_events: number;
  blog_views: number;
  market_hub_views: number;
  referral_landings: number;
  sources: TrafficSourceRow[];
  landings: TrafficLandingRow[];
  campaigns: TrafficCampaignRow[];
  daily: TrafficDailyRow[];
};

export type TrafficGrowthSignal = {
  status: "scale" | "build" | "fix" | "watch";
  title: string;
  reason: string;
  action: string;
  href: string;
  score: number;
};

const pct = (part: number, total: number) => (total > 0 ? (part / total) * 100 : 0);

export function buildTrafficGrowthDashboard(raw: TrafficSnapshot) {
  const current = Math.max(0, Number(raw.current_visitors || 0));
  const previous = Math.max(0, Number(raw.previous_visitors || 0));
  const gap = Math.max(0, MONTHLY_TRAFFIC_TARGET - current);
  const progressPct = Math.min(100, pct(current, MONTHLY_TRAFFIC_TARGET));
  const targetMultiple = current > 0 ? MONTHLY_TRAFFIC_TARGET / current : null;
  const trendPct = previous > 0 ? ((current - previous) / previous) * 100 : null;
  const pageViewCoverage = pct(raw.page_view_visitors, current);
  const organicShare = pct(raw.organic_visitors, current);
  const attributionCoverage = pct(raw.attributed_visitors, current);
  const targetDailyPace = MONTHLY_TRAFFIC_TARGET / Math.max(1, raw.window_days || 30);
  const observedDailyAverage = current / Math.max(1, raw.window_days || 30);
  const signals: TrafficGrowthSignal[] = [];

  if (pageViewCoverage < 80) {
    signals.push({
      status: "build",
      title: "Complete page-view measurement rollout",
      reason: `${pageViewCoverage.toFixed(1)}% of tracked visitors have a page_viewed event in this window.`,
      action: "Let the new page-view event collect forward-only traffic data before treating tracked visitors as complete site traffic.",
      href: "/admin/analytics",
      score: 120,
    });
  }

  if (organicShare >= 50) {
    signals.push({
      status: "scale",
      title: "Organic search is the primary acquisition engine",
      reason: `${organicShare.toFixed(1)}% of tracked visitors are attributed to organic search in this window.`,
      action: "Prioritize the existing keyword owners, internal authority graph, content refresh queue and high-intent landing pages before adding low-signal channels.",
      href: "/admin/seo/authority",
      score: 115,
    });
  } else if (current > 0) {
    signals.push({
      status: "watch",
      title: "Organic search has room to contribute more",
      reason: `${organicShare.toFixed(1)}% of tracked visitors are attributed to organic search.`,
      action: "Use Search Console evidence, the SEO content engine and internal authority graph to improve qualified organic acquisition.",
      href: "/admin/seo/content",
      score: 85,
    });
  }

  if (raw.blog_views > 0 && current > 0) {
    const blogReach = pct(raw.blog_views, current);
    signals.push({
      status: blogReach < 5 ? "build" : "scale",
      title: blogReach < 5 ? "Content distribution has headroom" : "Blog content is reaching tracked visitors",
      reason: `${raw.blog_views.toLocaleString("en-IN")} blog article view events were recorded in the current window.`,
      action: blogReach < 5
        ? "Use the Phase 42 tracked distribution queue to push existing high-value guides before publishing more articles."
        : "Keep distributing the guides that already produce qualified visits and service clicks.",
      href: "/admin/crm/distribution",
      score: blogReach < 5 ? 95 : 70,
    });
  }

  if (raw.referral_landings === 0) {
    signals.push({
      status: "build",
      title: "Referral traffic loop is not yet contributing measurable landings",
      reason: "No referral_landing_view events were recorded in the selected window.",
      action: "Use the Phase 43 referral center and account-linked referral URLs; do not invent incentives beyond the live programme rules.",
      href: "/dashboard/referrals",
      score: 90,
    });
  }

  if (attributionCoverage < 85 && current > 0) {
    signals.push({
      status: "fix",
      title: "Acquisition attribution coverage needs improvement",
      reason: `${attributionCoverage.toFixed(1)}% of tracked visitors have a first-touch source.`,
      action: "Keep UTM-tagged distribution/referral links consistent and investigate unattributed acquisition before scaling spend.",
      href: "/admin/analytics",
      score: 110,
    });
  }

  if (trendPct !== null) {
    signals.push({
      status: trendPct >= 0 ? "scale" : "watch",
      title: trendPct >= 0 ? "Tracked traffic is growing vs the previous window" : "Tracked traffic declined vs the previous window",
      reason: `${trendPct >= 0 ? "+" : ""}${trendPct.toFixed(1)}% vs the previous ${raw.window_days}-day window.`,
      action: "Use the source and landing-page tables to identify which acquisition paths explain the change before reallocating effort.",
      href: "/admin/growth/traffic",
      score: 80,
    });
  }

  signals.sort((a, b) => b.score - a.score);

  return {
    ...raw,
    target: MONTHLY_TRAFFIC_TARGET,
    targetGap: gap,
    targetProgressPct: progressPct,
    targetMultiple,
    targetDailyPace,
    observedDailyAverage,
    trendPct,
    pageViewCoverage,
    organicShare,
    attributionCoverage,
    signals,
    note:
      "The 100K figure is a roadmap target, not a forecast. Until page_viewed coverage matures, tracked visitors mean unique first-party analytics identities with at least one recorded event, not an audited count of every website visitor.",
  };
}
