import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  MONTHLY_TRAFFIC_TARGET,
  buildTrafficGrowthDashboard,
} from "../../lib/analytics/traffic-engine.ts";

const read = (path: string) =>
  readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 45 computes the 100K roadmap gap from verified tracked traffic", () => {
  const dashboard = buildTrafficGrowthDashboard({
    window_days: 30,
    current_visitors: 8_000,
    previous_visitors: 6_400,
    page_views: 7_000,
    page_view_visitors: 4_000,
    organic_visitors: 6_000,
    attributed_visitors: 7_600,
    organic_landing_events: 4_000,
    blog_views: 120,
    market_hub_views: 25,
    referral_landings: 0,
    sources: [{ source: "google", medium: "organic", visitors: 6_000 }],
    landings: [{ path: "/youtube-subscribers", visitors: 2_000 }],
    campaigns: [],
    daily: [],
  });

  assert.equal(MONTHLY_TRAFFIC_TARGET, 100_000);
  assert.equal(dashboard.targetGap, 92_000);
  assert.equal(dashboard.targetProgressPct, 8);
  assert.equal(dashboard.targetMultiple, 12.5);
  assert.equal(dashboard.organicShare, 75);
  assert.equal(dashboard.attributionCoverage, 95);
  assert.equal(dashboard.pageViewCoverage, 50);
  assert.equal(dashboard.trendPct, 25);
  assert.match(dashboard.note, /roadmap target, not a forecast/);
});

test("Phase 45 prioritizes measurement and the verified organic engine", () => {
  const dashboard = buildTrafficGrowthDashboard({
    window_days: 30,
    current_visitors: 1_000,
    previous_visitors: 900,
    page_views: 200,
    page_view_visitors: 200,
    organic_visitors: 700,
    attributed_visitors: 950,
    organic_landing_events: 500,
    blog_views: 10,
    market_hub_views: 3,
    referral_landings: 0,
    sources: [],
    landings: [],
    campaigns: [],
    daily: [],
  });

  assert.ok(dashboard.signals.some((signal) => signal.title === "Complete page-view measurement rollout"));
  assert.ok(dashboard.signals.some((signal) => signal.title === "Organic search is the primary acquisition engine"));
  assert.ok(dashboard.signals.some((signal) => signal.title === "Referral traffic loop is not yet contributing measurable landings"));
});

test("Phase 45 records a generic consent-aware page view on route changes", () => {
  const events = read("lib/analytics/events.ts");
  const pageAnalytics = read("components/analytics/PageAnalytics.tsx");

  assert.match(events, /"page_viewed"/);
  assert.match(pageAnalytics, /track\("page_viewed"\)/);
  assert.match(events, /navigator\.doNotTrack === "1"/);
});

test("Phase 45 synchronizes newer analytics events instead of silently dropping them", () => {
  const migration = read("supabase/migrations/20261008163500_phase45_traffic_measurement.sql");

  for (const event of [
    "page_viewed",
    "payment_funnel_step",
    "checkout_recovery_view",
    "referral_landing_view",
    "referral_signup_attributed",
    "referral_center_view",
    "retention_next_action_view",
    "homepage_conversion_path_click",
    "agency_growth_next_action_view",
  ]) {
    assert.match(migration, new RegExp(`'${event}'`));
  }

  assert.match(migration, /create or replace function public\.record_analytics_event/);
  assert.match(migration, /v_client_events text\[\]/);
});

test("Phase 45 traffic aggregation is server-only and does not expose raw analytics", () => {
  const migration = read("supabase/migrations/20261008163500_phase45_traffic_measurement.sql");

  assert.match(migration, /create or replace function public\.admin_traffic_growth_snapshot/);
  assert.match(migration, /security invoker/);
  assert.match(migration, /revoke execute on function public\.admin_traffic_growth_snapshot\(integer\) from anon, authenticated/);
  assert.match(migration, /grant execute on function public\.admin_traffic_growth_snapshot\(integer\) to service_role/);
});

test("Phase 45 exposes the traffic workspace and labels the 100K number as target arithmetic", () => {
  const sidebar = read("components/admin/AdminSidebar.tsx");
  const page = read("app/admin/growth/traffic/page.tsx");

  assert.match(sidebar, /100K Traffic/);
  assert.match(sidebar, /\/admin\/growth\/traffic/);
  assert.match(page, /Phase 45 · 100K Traffic Engine/);
  assert.match(page, /roadmap target/);
  assert.match(page, /This is target arithmetic only/);
  assert.match(page, /does not predict when SocialRUSH will reach 100K/);
});
