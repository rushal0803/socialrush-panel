import Link from "next/link";
import { ArrowUpRight, BarChart3, Gauge, Search, Share2, Target } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildTrafficGrowthDashboard,
  type TrafficSnapshot,
} from "@/lib/analytics/traffic-engine";

export const dynamic = "force-dynamic";

const emptySnapshot: TrafficSnapshot = {
  window_days: 30,
  current_visitors: 0,
  previous_visitors: 0,
  page_views: 0,
  page_view_visitors: 0,
  organic_visitors: 0,
  attributed_visitors: 0,
  organic_landing_events: 0,
  blog_views: 0,
  market_hub_views: 0,
  referral_landings: 0,
  sources: [],
  landings: [],
  campaigns: [],
  daily: [],
};

const number = (value: number) => Math.round(value).toLocaleString("en-IN");
const pct = (value: number) => `${value.toFixed(1)}%`;

export default async function TrafficGrowthPage() {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("admin_traffic_growth_snapshot", {
    p_window_days: 30,
  });

  const raw =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as unknown as TrafficSnapshot)
      : emptySnapshot;
  const dashboard = buildTrafficGrowthDashboard(raw);

  return (
    <main className="mx-auto max-w-[1650px] p-4 pb-20 sm:p-8">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-orange-300">
            Phase 45 · 100K Traffic Engine
          </p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
            Verified traffic growth command center
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#A8AFBD]">
            Measure first-party tracked acquisition, source mix, landing pages and growth loops against the 100,000 monthly traffic roadmap target.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/seo/authority" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-4 text-xs font-bold text-white">
            SEO authority <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/admin/crm/distribution" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 text-xs font-bold text-orange-100">
            Distribution queue <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4 text-sm leading-6 text-sky-100">
        <p>{dashboard.note}</p>
        {error ? (
          <p className="mt-2 text-amber-100">
            Traffic snapshot RPC is not available in this environment yet. The dashboard will populate after the Phase 45 database migration is applied.
          </p>
        ) : null}
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {[
          ["Tracked visitors", number(dashboard.current_visitors), "Current 30-day window"],
          ["100K progress", pct(dashboard.targetProgressPct), `${number(dashboard.targetGap)} remaining`],
          ["Organic share", pct(dashboard.organicShare), "First-touch tracked visitors"],
          ["Attribution", pct(dashboard.attributionCoverage), "Tracked visitors with source"],
          ["Page-view coverage", pct(dashboard.pageViewCoverage), "Forward measurement rollout"],
          ["Trend", dashboard.trendPct === null ? "—" : `${dashboard.trendPct >= 0 ? "+" : ""}${pct(dashboard.trendPct)}`, "Vs previous 30 days"],
        ].map(([label, value, note]) => (
          <article key={label} className="rounded-2xl border border-white/10 bg-[#111111] p-5">
            <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#8B93A1]">{label}</p>
            <b className="mt-3 block text-3xl text-white">{value}</b>
            <p className="mt-2 text-xs text-[#8B93A1]">{note}</p>
          </article>
        ))}
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-300" />
            <h2 className="font-bold text-white">100K target math</h2>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-300" style={{ width: `${dashboard.targetProgressPct}%` }} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div><p className="text-[10px] uppercase text-[#737B8B]">Target pace</p><p className="mt-1 font-bold text-white">{number(dashboard.targetDailyPace)}/day</p></div>
            <div><p className="text-[10px] uppercase text-[#737B8B]">Observed tracked avg.</p><p className="mt-1 font-bold text-white">{number(dashboard.observedDailyAverage)}/day</p></div>
            <div><p className="text-[10px] uppercase text-[#737B8B]">Target multiple</p><p className="mt-1 font-bold text-white">{dashboard.targetMultiple ? `${dashboard.targetMultiple.toFixed(1)}×` : "—"}</p></div>
          </div>
          <p className="mt-4 text-xs leading-5 text-[#8B93A1]">
            This is target arithmetic only. It does not predict when SocialRUSH will reach 100K.
          </p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-orange-300" />
            <h2 className="font-bold text-white">Measured growth loops</h2>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-white/[.03] p-3"><p className="text-[#8B93A1]">Organic landings</p><b className="mt-1 block text-xl text-white">{number(dashboard.organic_landing_events)}</b></div>
            <div className="rounded-xl bg-white/[.03] p-3"><p className="text-[#8B93A1]">Blog views</p><b className="mt-1 block text-xl text-white">{number(dashboard.blog_views)}</b></div>
            <div className="rounded-xl bg-white/[.03] p-3"><p className="text-[#8B93A1]">Market-hub views</p><b className="mt-1 block text-xl text-white">{number(dashboard.market_hub_views)}</b></div>
            <div className="rounded-xl bg-white/[.03] p-3"><p className="text-[#8B93A1]">Referral landings</p><b className="mt-1 block text-xl text-white">{number(dashboard.referral_landings)}</b></div>
          </div>
        </article>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-2">
        <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
          <div className="border-b border-white/10 p-5">
            <div className="flex items-center gap-2"><Search className="h-5 w-5 text-orange-300" /><h2 className="font-bold text-white">Acquisition sources</h2></div>
          </div>
          <div className="divide-y divide-white/10">
            {dashboard.sources.length ? dashboard.sources.map((row) => (
              <div key={`${row.source}-${row.medium}`} className="flex items-center justify-between gap-4 p-4">
                <div><p className="font-bold text-white">{row.source}</p><p className="text-[11px] uppercase text-[#737B8B]">{row.medium}</p></div>
                <b className="text-white">{number(row.visitors)}</b>
              </div>
            )) : <p className="p-5 text-sm text-[#8B93A1]">No tracked source data yet.</p>}
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
          <div className="border-b border-white/10 p-5">
            <div className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-orange-300" /><h2 className="font-bold text-white">Top first-touch landing pages</h2></div>
          </div>
          <div className="divide-y divide-white/10">
            {dashboard.landings.length ? dashboard.landings.map((row) => (
              <div key={row.path} className="flex items-center justify-between gap-4 p-4">
                <p className="min-w-0 break-all text-sm font-semibold text-white">{row.path}</p>
                <b className="shrink-0 text-white">{number(row.visitors)}</b>
              </div>
            )) : <p className="p-5 text-sm text-[#8B93A1]">No landing-page data yet.</p>}
          </div>
        </article>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-2">
        <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
          <div className="border-b border-white/10 p-5">
            <h2 className="font-bold text-white">Tracked campaigns</h2>
            <p className="mt-1 text-xs text-[#8B93A1]">UTM-attributed first-touch visitors only.</p>
          </div>
          <div className="divide-y divide-white/10">
            {dashboard.campaigns.length ? dashboard.campaigns.map((row) => (
              <div key={`${row.campaign}-${row.source}`} className="flex items-center justify-between gap-4 p-4">
                <div><p className="font-bold text-white">{row.campaign}</p><p className="text-[11px] text-[#737B8B]">{row.source}</p></div>
                <b className="text-white">{number(row.visitors)}</b>
              </div>
            )) : <p className="p-5 text-sm text-[#8B93A1]">No campaign-attributed visitors yet.</p>}
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
          <div className="border-b border-white/10 p-5">
            <h2 className="font-bold text-white">Recent daily tracked visitors</h2>
            <p className="mt-1 text-xs text-[#8B93A1]">Asia/Kolkata daily unique first-party identities.</p>
          </div>
          <div className="divide-y divide-white/10">
            {dashboard.daily.length ? dashboard.daily.slice(-10).map((row) => (
              <div key={row.date} className="flex items-center justify-between gap-4 p-4">
                <p className="text-sm font-semibold text-white">{row.date}</p>
                <b className="text-white">{number(row.visitors)}</b>
              </div>
            )) : <p className="p-5 text-sm text-[#8B93A1]">No daily traffic data yet.</p>}
          </div>
        </article>
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-2"><Share2 className="h-5 w-5 text-orange-300" /><h2 className="font-bold text-white">Next traffic actions</h2></div>
          <p className="mt-1 text-xs text-[#8B93A1]">Ranked from verified first-party signals, not estimated reach.</p>
        </div>
        <div className="divide-y divide-white/10">
          {dashboard.signals.map((signal) => (
            <div key={signal.title} className="grid gap-3 p-5 md:grid-cols-[110px_1fr_auto] md:items-start">
              <span className="w-fit rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#D1D5DB]">{signal.status}</span>
              <div>
                <p className="font-bold text-white">{signal.title}</p>
                <p className="mt-1 text-xs leading-5 text-[#A8AFBD]">{signal.reason}</p>
                <p className="mt-2 text-xs font-semibold text-orange-100">{signal.action}</p>
              </div>
              <Link href={signal.href} className="text-xs font-bold text-orange-300 hover:text-orange-200">Open →</Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
