import type { VerifiedRevenueDashboard } from "@/lib/analytics/revenue-dashboard";

const money = (value: number) => value.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function RevenueIntelligencePanel({ dashboard }: { dashboard: VerifiedRevenueDashboard }) {
  const customer = dashboard.customerContribution;
  const qualityIssues = dashboard.quality.invalidChargeOrders + dashboard.quality.missingPlatformOrders + dashboard.quality.missingCustomerOrders;

  return (
    <section className="mt-6 rounded-2xl border border-violet-400/20 bg-[#111] p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.16em] text-violet-300">Phase 44 · Verified revenue intelligence</p>
          <h2 className="mt-2 text-xl font-black text-white">Revenue trend, platform mix &amp; customer contribution</h2>
          <p className="mt-1 max-w-4xl text-xs leading-5 text-slate-500">Built only from verified paid-order records and completed refund transactions. Multi-order contribution means second-and-later paid orders inside the selected range; it is not presented as lifetime customer LTV.</p>
        </div>
        <span className="w-fit rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-xs font-black text-violet-200">
          {qualityIssues ? String(qualityIssues) + " data-quality flag" + (qualityIssues === 1 ? "" : "s") : "Verified inputs clean"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Best net-revenue day" value={dashboard.bestDay ? money(dashboard.bestDay.net) : "—"} note={dashboard.bestDay?.date ?? "No paid-order data"} />
        <Metric label="Identified customers" value={String(customer.identifiedCustomers)} note={String(customer.anonymousOrUnknownOrders) + " paid order" + (customer.anonymousOrUnknownOrders === 1 ? "" : "s") + " without customer ID"} />
        <Metric label="Multi-order customers" value={customer.multiOrderCustomerRate.toFixed(1) + "%"} note={String(customer.multiOrderCustomers) + " customers placed 2+ paid orders in range"} />
        <Metric label="Subsequent-order revenue" value={money(customer.subsequentOrderRevenue)} note={customer.subsequentOrderRevenueShare.toFixed(1) + "% of selected-range gross revenue"} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <article className="rounded-xl border border-white/10 bg-black/25 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-white">Daily verified revenue</h3>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">Net = paid-order gross minus completed refunds recorded on that day.</p>
            </div>
            <span className="text-[10px] uppercase tracking-wide text-slate-500">Asia/Kolkata</span>
          </div>
          {dashboard.daily.length ? (
            <div className="mt-4 space-y-3">
              {dashboard.daily.slice(-14).map((row) => {
                const width = dashboard.maxDailyNet ? Math.max(2, (row.net / dashboard.maxDailyNet) * 100) : 0;
                return (
                  <div key={row.date}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px]">
                      <span className="font-bold text-slate-300">{row.date}</span>
                      <span className="text-right text-slate-500">{row.orders} order{row.orders === 1 ? "" : "s"} · {money(row.net)} net</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[.06]">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" style={{ width: String(width) + "%" }} />
                    </div>
                    {row.refunds > 0 ? <p className="mt-1 text-[10px] text-amber-300">Gross {money(row.gross)} · refunds {money(row.refunds)}</p> : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-white/10 p-6 text-center text-xs text-slate-500">No verified paid-order revenue in this range.</p>
          )}
        </article>

        <article className="rounded-xl border border-white/10 bg-black/25 p-4">
          <h3 className="text-sm font-black text-white">Revenue by platform</h3>
          <p className="mt-1 text-[11px] leading-5 text-slate-500">Share and AOV use verified paid orders only.</p>
          {dashboard.platforms.length ? (
            <div className="mt-4 space-y-3">
              {dashboard.platforms.slice(0, 8).map((row) => (
                <div key={row.platform} className="rounded-lg border border-white/[.07] bg-white/[.025] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold capitalize text-white">{row.platform}</p>
                      <p className="mt-1 text-[10px] text-slate-500">{row.orders} order{row.orders === 1 ? "" : "s"} · AOV {money(row.aov)}</p>
                    </div>
                    <div className="text-right">
                      <b className="text-xs text-violet-200">{money(row.revenue)}</b>
                      <p className="mt-1 text-[10px] text-slate-500">{row.sharePct.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-white/10 p-6 text-center text-xs text-slate-500">No platform revenue data in this range.</p>
          )}
        </article>
      </div>

      {qualityIssues ? (
        <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/10 p-4 text-xs leading-5 text-amber-100">
          <b>Data-quality review:</b> {dashboard.quality.invalidChargeOrders} non-positive charge order(s), {dashboard.quality.missingPlatformOrders} missing-platform order(s), and {dashboard.quality.missingCustomerOrders} paid order(s) without a customer ID. These records remain visible instead of being silently guessed or reassigned.
        </div>
      ) : null}
    </section>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="rounded-xl border border-white/10 bg-black/25 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-black text-white">{value}</p>
      <p className="mt-1 text-[11px] leading-5 text-slate-500">{note}</p>
    </article>
  );
}