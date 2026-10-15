import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isOrganicSearchReferrer, track } from "../../lib/analytics/events.ts";
import { createClientAnalyticsSessionIdProvider, isValidAnalyticsSessionId, resolveAnalyticsSessionId } from "../../lib/analytics/session.ts";
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

test("Phase 8 identifies only external search referrers for organic landings", () => {
  const host = "www.getsocialrush.com";
  for (const referrer of [
    "https://www.google.com/search?q=organic",
    "https://www.google.co.in/search?q=services",
    "https://www.bing.com/search?q=smm",
    "https://duckduckgo.com/?q=socialrush",
  ]) {
    assert.equal(isOrganicSearchReferrer(referrer, host), true, referrer);
  }
  for (const referrer of [
    "",
    "https://www.getsocialrush.com/services",
    "https://getsocialrush.com/dashboard",
    "https://example.com/article",
    "https://notgoogle.com/ad",
    "not a valid referrer",
    "javascript:alert(1)",
  ]) {
    assert.equal(isOrganicSearchReferrer(referrer, host), false, referrer);
  }
});

test("Phase 8 tracks organic landings once per document but page views on navigation", () => {
  const analytics = read("components/analytics/PageAnalytics.tsx");
  assert.match(analytics, /const checkedInitialLanding = useRef\(false\)/);
  assert.match(analytics, /if \(!checkedInitialLanding\.current\) \{/);
  assert.match(analytics, /checkedInitialLanding\.current = true/);
  assert.match(analytics, /isOrganicSearchReferrer\(document\.referrer, window\.location\.hostname\)/);
  assert.match(analytics, /track\("organic_landing_view", \{ referrer_type: "search" \}\)/);
  assert.match(analytics, /track\("page_viewed"\)/);
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

test("Phase 15 correlates concurrent first-page analytics beacons before cookies arrive", () => {
  const entries = new Map<string, string>();
  const storage = {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => { entries.set(key, value); },
  };
  const initialId = "512047cb-27ea-4bbc-9ab0-29d27db43633";
  const fallbackId = "e1a11b09-f179-4286-a6cd-55e72f6b77bc";
  const provider = createClientAnalyticsSessionIdProvider();
  const pageView = provider(storage, () => initialId);
  const organicLanding = provider(storage, () => { throw new Error("Unexpected second UUID"); });
  assert.equal(pageView, organicLanding);
  // Simulate independently handled POSTs with no cookie, using the same request nonce.
  assert.equal(resolveAnalyticsSessionId(undefined, pageView, () => fallbackId), initialId);
  assert.equal(resolveAnalyticsSessionId(undefined, organicLanding, () => fallbackId), initialId);
  assert.equal(createClientAnalyticsSessionIdProvider()(storage, () => fallbackId), initialId);
});

test("Phase 15 server cookies override client correlation tokens and malformed tokens fail closed", () => {
  const clientId = "512047cb-27ea-4bbc-9ab0-29d27db43633";
  const cookieId = "e1a11b09-f179-4286-a6cd-55e72f6b77bc";
  assert.equal(resolveAnalyticsSessionId(cookieId, clientId, () => { throw new Error("Unexpected fallback"); }), cookieId);
  for (const submitted of ["garbage", "00000000-0000-0000-0000-000000000000", "aaaaaaaa-aaaa-4aaa-7aaa-aaaaaaaaaaaa", {}, null]) {
    assert.equal(resolveAnalyticsSessionId(undefined, submitted, () => cookieId), cookieId);
  }
  assert.equal(isValidAnalyticsSessionId(clientId), true);
  assert.equal(isValidAnalyticsSessionId(cookieId), true);
});

test("Phase 15 tolerates blocked tab storage and retains the existing privacy and API guardrails", () => {
  const clientId = "512047cb-27ea-4bbc-9ab0-29d27db43633";
  const provider = createClientAnalyticsSessionIdProvider();
  const blocked = {getItem() {throw new Error("blocked")}, setItem() {throw new Error("blocked")}};
  assert.equal(provider(blocked, () => clientId), clientId);
  assert.equal(provider(blocked, () => { throw new Error("Unexpected second UUID"); }), clientId);

  const events = read("lib/analytics/events.ts");
  const route = read("app/api/analytics/route.ts");
  assert.match(events, /navigator\.doNotTrack === "1"/);
  assert.match(events, /sessionId: getBrowserAnalyticsSessionId\(\)/);
  assert.match(route, /requireJson\(request, 8_192\)/);
  assert.match(route, /rateLimit\(request, "analytics", 120, 60_000\)/);
  assert.match(route, /resolveAnalyticsSessionId\(cookie, body\.sessionId/);
  assert.match(route, /if \(!isValidAnalyticsSessionId\(cookie\)\)/);
  assert.match(route, /httpOnly: true/);
});

test("Phase 16 records return page visits while keeping organic landings once per document", async () => {
  const names = ["window", "location", "navigator", "document"] as const;
  const previous = names.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)] as const);
  const storage = new Map<string, string>();
  const route = { pathname: "/phase16-return-visit-a" };
  const beacons: Blob[] = [];
  const browser = {
    crypto: { randomUUID: () => "512047cb-27ea-4bbc-9ab0-29d27db43633" },
    location: { hostname: "www.getsocialrush.com", search: "" },
    sessionStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, value); },
    },
  };
  const navigation = {
    doNotTrack: "0",
    sendBeacon: (_url: string, payload: Blob) => {
      beacons.push(payload);
      return true;
    },
  };
  try {
    for (const [name, value] of Object.entries({
      window: browser, location: route, navigator: navigation, document: { referrer: "" },
    })) {
      Object.defineProperty(globalThis, name, { configurable: true, value });
    }
    track("page_viewed");
    route.pathname = "/phase16-return-visit-b";
    track("page_viewed");
    route.pathname = "/phase16-return-visit-a";
    track("page_viewed");
    assert.equal(beacons.length, 3, "return to A should record a second A page view");

    // If PageAnalytics remounts, the unchanged original referrer must not
    // produce another organic landing on a later account route in this document.
    track("organic_landing_view", { referrer_type: "search" });
    route.pathname = "/dashboard/new-order";
    track("organic_landing_view", { referrer_type: "search" });
    assert.equal(beacons.length, 4, "one organic landing per document regardless of path");

    const payloads = await Promise.all(beacons.map(async (blob) => JSON.parse(await blob.text())));
    assert.deepEqual(payloads.map((row) => row.pagePath), [
      "/phase16-return-visit-a",
      "/phase16-return-visit-b",
      "/phase16-return-visit-a",
      "/phase16-return-visit-a",
    ]);
    assert.deepEqual(payloads.map((row) => row.event), [
      "page_viewed", "page_viewed", "page_viewed", "organic_landing_view",
    ]);
    assert.equal(new Set(payloads.map((row) => row.sessionId)).size, 1);
    navigation.doNotTrack = "1";
    track("page_viewed");
    assert.equal(beacons.length, 4, "Do Not Track must still suppress analytics");
  } finally {
    for (const [name, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    }
  }
});

test("Phase 18 counts repeat deliberate order actions without duplicating impressions", async () => {
  const names = ["window", "location", "navigator", "document"] as const;
  const previous = names.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)] as const);
  const beacons: Blob[] = [];
  const storage = new Map<string, string>();
  const navigation = {
    doNotTrack: "0",
    sendBeacon: (_url: string, payload: Blob) => { beacons.push(payload); return true; },
  };
  try {
    for (const [name, value] of Object.entries({
      window: {
        crypto: { randomUUID: () => "512047cb-27ea-4bbc-9ab0-29d27db43633" },
        location: { hostname: "www.getsocialrush.com", search: "" },
        sessionStorage: {
          getItem: (key: string) => storage.get(key) ?? null,
          setItem: (key: string, value: string) => { storage.set(key, value); },
        },
      },
      location: { pathname: "/phase18-repeat-order-actions" },
      navigator: navigation,
      document: { referrer: "" },
    })) Object.defineProperty(globalThis, name, { configurable: true, value });

    const properties = { service_code: "instagram-followers", platform: "instagram", quantity: 1000, surface: "service_order_card" };
    track("package_viewed", properties);
    track("package_viewed", properties); // Still one impression, not two.
    track("package_selected", properties);
    track("package_selected", properties); // User returned and selected again.
    track("new_order_clicked", properties);
    track("new_order_clicked", properties); // User intentionally continued again.
    const payloads = await Promise.all(beacons.map(async (blob) => JSON.parse(await blob.text())));
    assert.deepEqual(payloads.map((row) => row.event), [
      "package_viewed", "package_selected", "package_selected", "new_order_clicked", "new_order_clicked",
    ]);
    assert.ok(payloads.every((row) => row.pagePath === "/phase18-repeat-order-actions"));
    assert.equal(new Set(payloads.map((row) => row.sessionId)).size, 1);

    navigation.doNotTrack = "1";
    track("new_order_clicked", properties);
    track("package_selected", properties);
    assert.equal(beacons.length, 5, "Do Not Track must continue to suppress clicks");
  } finally {
    for (const [name, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    }
  }
});
