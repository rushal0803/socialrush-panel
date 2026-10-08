import Link from "next/link";
import { ArrowUpRight, Gauge, Layers3, Repeat2, Target, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buildVerifiedRevenueDashboard } from "@/lib/analytics/revenue-dashboard";
import {
  buildMonthlyRevenueGoal,
  indiaMonthKey,
  MONTHLY_REVENUE_TARGET,
  TARGET_AOV,
} from "@/lib/analytics/revenue-goal-engine";

export const dynamic = "force-dynamic";

const money = (value: number) =>
  value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

export default async function RevenueGoalPage() {
  const db = await createClient();
  const now = new Date();
  const currentMonth = indiaMonthKey(now);
  const since = new Date(now.getTime() - 40 * 86_400_000).toISOString();

  const [ordersResult, transactionsResult] = await Promise.all([
    db
      .from("orders")
      .select("id,user_id,platform,service_name,charge,status,payment_status,created_at")
      .gte("created_at", since),
    db
      .from("transactions")
      .select("amount,type,status,created_at")
      .gte("created_at", since),
  ]);

  const paidOrders = (ordersResult.data ?? []).filter(
    (order) =>
      order.status !== "failed" &&
      order.status !== "cancelled" &&
      ["paid", "completed"].includes(order.payment_status ?? "") &&
      indiaMonthKey(order.created_at) === currentMonth,
  );

  const refundRows = (transactionsResult.data ?? []).filter(
    (transaction) =>
      transaction.type === "refund" &&
      transaction.status === "completed" &&
      indiaMonthKey(transaction.created_at) === currentMonth,
  );

  const grossRevenue = paidOrders.reduce((sum, order) => sum + Math.max(0, Number(order.charge ?? 0) || 0), 0);
  const refunds = refundRows.reduce((sum, transaction) => sum + Math.max(0, Number(transaction.amount ?? 0) || 0), 0);
  const netRevenue = Math.max(0, grossRevenue - refunds);
  const aov = paidOrders.length ? grossRevenue / paidOrders.length : 0;

  const revenueDashboard = buildVerifiedRevenueDashboard({
    paidOrders,
    refunds: refundRows.map((row) => ({ amount: row.amount, created_at: row.created_at })),
  });

  const top = revenueDashboard.platforms[0] ?? null;
  const dashboard = buildMonthlyRevenueGoal({
    now,
    grossRevenue,
    refunds,
    netRevenue,
    paidOrders: paidOrders.length,
    aov,
    repeatRevenueShare: revenueDashboard.customerContribution.subsequentOrderRevenueShare,
    multiOrderCustomerRate: revenueDashboard.customerContribution.multiOrderCustomerRate,
    topPlatform: top
      ? { platform: top.platform, revenue: top.revenue, orders: top.orders, sharePct: top.sharePct }
      : null,
  });

  const hasDataError = Boolean(ordersResult.error || transactionsResult.error);

  return (
    <main className="mx-auto max-w-[1650px] p-4 pb-20 sm:p-8">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-orange-300">
            Phase 46 · ₹5L Monthly Revenue Engine
          </p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
            Verified monthly revenue control center
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#A8AFBD]">
            Track verified month-to-date net revenue against the ₹5,00,000 roadmap target and rank the growth levers that can close the gap without inventing revenue, discounts or forecasts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/analytics" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-4 text-xs font-bold text-white">
            Revenue analytics <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/admin/growth/traffic" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 text-xs font-bold text-orange-100">
            100K traffic <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4 text-sm leading-6 text-sky-100">
        <p>{dashboard.note}</p>
        {hasDataError ? (
          <p className="mt-2 text-amber-100">
            One or more verified revenue queries failed. Do not use this dashboard for decisions until the data source is healthy.
          </p>
        ) : null}
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {[
          ["MTD net revenue", money(dashboard.netRevenue), "Verified paid orders minus completed refunds"],
          ["₹5L progress", dashboard.progressPct.toFixed(1) + "%", money(dashboard.targetGap) + " remaining"],
          ["Verified AOV", dashboard.aov ? money(dashboard.aov) : "—", `Operating target ${money(TARGET_AOV)}+`],
          ["Paid orders", dashboard.paidOrders.toLocaleString("en-IN"), "Current India calendar month"],
          ["Repeat revenue", dashboard.repeatRevenueShare.toFixed(1) + "%", "Second-and-later paid-order contribution"],
          ["Daily net avg.", money(dashboard.observedDailyRevenue), `Target pace ${money(dashboard.targetDailyRevenue)}/day`],
        ].map(([label, value, note]) => (
          <article key={label} className="rounded-2xl border border-white/10 bg-[#111111] p-5">
            <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#8B93A1]">{label}</p>
            <b className="mt-3 block text-3xl text-white">{value}</b>
            <p className="mt-2 text-xs leading-5 text-[#8B93A1]">{note}</p>
          </article>
        ))}
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-300" />
            <h2 className="font-bold text-white">₹5L target math</h2>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-300"
              style={{ width: `${dashboard.progressPct}%` }}
            />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Expected MTD" value={money(dashboard.expectedMtdRevenue)} note={dashboard.expectedMtdProgressPct.toFixed(1) + "% of month elapsed"} />
            <Metric label="Required daily net" value={dashboard.targetGap ? money(dashboard.requiredDailyRevenue) : "Target met"} note={dashboard.remainingDays + " day(s) remaining"} />
            <Metric label="Orders at current AOV" value={dashboard.ordersAtCurrentAov?.toLocaleString("en-IN") ?? "—"} note="Whole-month target arithmetic" />
            <Metric label="Orders at ₹1,500 AOV" value={dashboard.ordersAtTargetAov.toLocaleString("en-IN")} note="334 orders/month target math" />
          </div>
          <p className="mt-4 text-xs leading-5 text-[#8B93A1]">
            The order counts and required daily revenue are arithmetic, not predictions. Current values use verified paid-order and completed-refund records only.
          </p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-orange-300" />
            <h2 className="font-bold text-white">Revenue quality</h2>
          </div>
          <div className="mt-4 space-y-3">
            <Metric label="Gross revenue" value={money(dashboard.grossRevenue)} note="Before completed refunds" />
            <Metric label="Completed refunds" value={money(dashboard.refunds)} note="Subtracted from target progress" />
            <Metric label="Multi-order customers" value={dashboard.multiOrderCustomerRate.toFixed(1) + "%"} note="Identified customers with 2+ paid orders in month" />
            <Metric
              label="Top platform"
              value={dashboard.topPlatform?.platform ?? "—"}
              note={dashboard.topPlatform ? `${dashboard.topPlatform.sharePct.toFixed(1)}% of verified gross revenue` : "No verified platform mix yet"}
            />
          </div>
        </article>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-3">
        <Link href="/packages" className="rounded-2xl border border-white/10 bg-[#111111] p-5 transition hover:border-orange-400/30">
          <Layers3 className="h-5 w-5 text-orange-300" />
          <h2 className="mt-3 font-bold text-white">AOV lever</h2>
          <p className="mt-2 text-xs leading-5 text-[#A8AFBD]">Use relevant larger quantities and packages when current AOV is below the operating target.</p>
        </Link>
        <Link href="/admin/crm/reactivation" className="rounded-2xl border border-white/10 bg-[#111111] p-5 transition hover:border-orange-400/30">
          <Repeat2 className="h-5 w-5 text-orange-300" />
          <h2 className="mt-3 font-bold text-white">Retention lever</h2>
          <p className="mt-2 text-xs leading-5 text-[#A8AFBD]">Increase repeat contribution through existing consent-aware retention and reactivation journeys.</p>
        </Link>
        <Link href="/dashboard/reseller" className="rounded-2xl border border-white/10 bg-[#111111] p-5 transition hover:border-orange-400/30">
          <TrendingUp className="h-5 w-5 text-orange-300" />
          <h2 className="mt-3 font-bold text-white">Agency lever</h2>
          <p className="mt-2 text-xs leading-5 text-[#A8AFBD]">Use client workspaces, monthly plans and renewals for recurring higher-value requirements.</p>
        </Link>
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
        <div className="border-b border-white/10 p-5">
          <h2 className="font-bold text-white">Next revenue actions</h2>
          <p className="mt-1 text-xs text-[#8B93A1]">Ranked from verified current-month revenue signals and existing growth systems.</p>
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

      <p className="mt-5 text-[11px] leading-5 text-[#737B8B]">
        Monthly target: {money(MONTHLY_REVENUE_TARGET)}. Phase 46 does not alter prices, wallet balances, payment amounts, fulfillment rules or order submission behavior.
      </p>
    </main>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl bg-white/[.03] p-3">
      <p className="text-[10px] uppercase tracking-wide text-[#737B8B]">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
      <p className="mt-1 text-[11px] leading-5 text-[#8B93A1]">{note}</p>
    </div>
  );
}
