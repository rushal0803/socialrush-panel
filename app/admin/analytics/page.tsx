import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const ranges = { today: 1, "7d": 7, "30d": 30, "90d": 90 } as const;
const funnel = ["service_selected", "order_started", "checkout_started", "payment_started", "payment_completed", "order_created"] as const;
const pct = (from: number, to: number) => from ? `${((to / from) * 100).toFixed(1)}%` : "—";
const money = (value: number) => value.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default async function Page({ searchParams }: { searchParams: { range?: string } }) {
  const db = await createClient();
  const key = searchParams.range && searchParams.range in ranges ? searchParams.range as keyof typeof ranges : "30d";
  const days = ranges[key];
  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  const [analyticsResult, ordersResult, transactionsResult, supportResult] = await Promise.all([
    db.from("analytics_events").select("event_name,customer_id,anonymous_session_id,platform,service_code,device_category,source,medium,campaign,created_at").gte("created_at", since),
    db.from("orders").select("id,user_id,service_name,platform,charge,status,payment_status,created_at").gte("created_at", since),
    db.from("transactions").select("amount,type,status,payment_method,created_at").gte("created_at", since),
    db.from("support_tickets").select("id", { count: "exact", head: true }).gte("created_at", since),
  ]);

  const events = analyticsResult.data ?? [];
  const orders = ordersResult.data ?? [];
  const transactions = transactionsResult.data ?? [];
  const supportCount = supportResult.count ?? 0;
  const queryFailed = Boolean(analyticsResult.error || ordersResult.error || transactionsResult.error || supportResult.error);

  if (analyticsResult.error) console.error("[admin analytics] analytics events query failed", { code: analyticsResult.error.code });
  if (ordersResult.error) console.error("[admin analytics] orders query failed", { code: ordersResult.error.code });
  if (transactionsResult.error) console.error("[admin analytics] transactions query failed", { code: transactionsResult.error.code });
  if (supportResult.error) console.error("[admin analytics] support count query failed", { code: supportResult.error.code });

  const count = (name: string) => events.filter((event) => event.event_name === name).length;
  const visitors = new Set(events.map((event) => event.customer_id || event.anonymous_session_id).filter(Boolean)).size;
  const createdOrders = orders.filter((order) => order.status !== "failed" && order.status !== "cancelled");
  const paidOrders = createdOrders.filter((order) => ["paid", "completed"].includes(order.payment_status || ""));
  const completedOrders = createdOrders.filter((order) => order.status === "completed");
  const completedCustomers = new Set(completedOrders.map((order) => order.user_id).filter(Boolean));
  const repeatOrders = Math.max(0, completedOrders.length - completedCustomers.size);
  const starts = count("order_started");
  const paymentStarts = count("payment_started");
  const paymentCompletions = count("payment_completed");
  const gross = paidOrders.reduce((sum, order) => sum + Number(order.charge || 0), 0);
  const refunds = transactions
    .filter((transaction) => transaction.type === "refund" && transaction.status === "completed")
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const netRevenue = Math.max(0, gross - refunds);
  const refundRate = gross ? (refunds / gross) * 100 : 0;
  const aov = paidOrders.length ? gross / paidOrders.length : 0;
  const revenuePerDay = netRevenue / Math.max(1, days);
  const first = events.length ? events.reduce((earliest, event) => earliest < event.created_at ? earliest : event.created_at, events[0].created_at) : null;

  const serviceRevenue = new Map<string, { revenue: number; orders: number; platform: string }>();
  for (const order of paidOrders) {
    const name = order.service_name || "Unknown service";
    const current = serviceRevenue.get(name) || { revenue: 0, orders: 0, platform: order.platform || "—" };
    current.revenue += Number(order.charge || 0);
    current.orders += 1;
    serviceRevenue.set(name, current);
  }
  const topServices = [...serviceRevenue.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

  const cards = [
    ["Unique sessions/users", visitors],
    ["Order starts", starts],
    ["Orders created", createdOrders.length],
    ["Order conversion", pct(starts, createdOrders.length)],
    ["Payment success", pct(paymentStarts, paymentCompletions)],
    ["Repeat-order rate", pct(completedOrders.length, repeatOrders)],
    ["Support tickets", supportCount],
    ["Refund rate", `${refundRate.toFixed(1)}%`],
  ];

  return <main className="p-4 pb-24 sm:p-8"><div className="mx-auto max-w-[1500px]">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">SocialRUSH $1M Command Center</p>
        <h1 className="mt-2 text-3xl font-black text-white">Revenue &amp; Conversion</h1>
        <p className="mt-2 max-w-4xl text-sm text-slate-400">First-party funnel data plus verified order and transaction records. Use this page to improve the five numbers that drive growth: qualified traffic, conversion, average order value, repeat purchases and margin.</p>
      </div>
      <div className="rounded-2xl border border-orange-400/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-100">
        Reporting timezone: Asia/Kolkata<br />Collection started: {first ? new Date(first).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "No events yet"}
      </div>
    </div>

    {queryFailed ? <div role="alert" className="mt-5 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100"><strong>Analytics reports are temporarily unavailable.</strong><p>Analytics data will appear here as customers begin using the website.</p></div> : null}

    <div className="mt-5 flex flex-wrap gap-2">{Object.keys(ranges).map((range) => <Link key={range} href={`?range=${range}`} className={`rounded-xl px-4 py-2 text-xs font-bold ${range === key ? "bg-orange-500 text-white" : "border border-white/10 text-slate-300"}`}>{range === "today" ? "Today" : `Last ${range.slice(0, -1)} days`}</Link>)}</div>

    <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">{cards.map(([label, value]) => <article key={label} className="min-w-0 rounded-2xl border border-white/10 bg-[#111] p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-2 break-words text-2xl font-black text-white">{value}</p></article>)}</section>

    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {[
        ["Gross revenue", money(gross), "Paid orders before refunds"],
        ["Net revenue", money(netRevenue), "Gross revenue minus completed refunds"],
        ["Average order value", money(aov), "Target: raise this with bundles and upsells"],
        ["Revenue / day", money(revenuePerDay), `Average across ${key === "today" ? "today" : `${days} days`}`],
        ["Paid orders", paidOrders.length, "Verified paid/completed orders"],
      ].map(([label, value, note]) => <article key={label} className="rounded-2xl border border-white/10 bg-[#111] p-5"><p className="text-xs text-slate-400">{label}</p><p className="mt-2 text-2xl font-black text-white">{value}</p><p className="mt-2 text-xs leading-5 text-slate-500">{note}</p></article>)}
    </section>

    <section className="mt-6 rounded-2xl border border-white/10 bg-[#111] p-5"><h2 className="text-xl font-black text-white">Order funnel</h2>{events.length ? <ol className="mt-5 grid gap-3 lg:grid-cols-6">{funnel.map((step, index) => { const total = step === "order_created" ? createdOrders.length : count(step); const previous = index ? funnel[index - 1] : null; const previousTotal = previous ? previous === "order_created" ? createdOrders.length : count(previous) : total; return <li key={step} className="rounded-xl bg-black/30 p-4"><p className="break-words text-xs capitalize text-slate-300">{step.replaceAll("_", " ")}</p><p className="mt-2 text-2xl font-black text-white">{total}</p><p className="mt-1 text-xs text-orange-300">{index ? `${pct(previousTotal, total)} continued · ${previousTotal ? pct(previousTotal, Math.max(0, previousTotal - total)) : "—"} drop-off` : "Entry step"}</p></li>; })}</ol> : <p className="mt-5 rounded-xl border border-dashed border-white/15 p-8 text-center text-slate-400">Not enough data.</p>}</section>

    <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <article className="rounded-2xl border border-white/10 bg-[#111] p-5">
        <div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-black text-white">Top revenue services</h2><p className="mt-1 text-xs text-slate-500">Use this to decide what deserves homepage, SEO and remarketing attention.</p></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-slate-400">{paidOrders.length} paid orders</span></div>
        {topServices.length ? <div className="mt-5 space-y-3">{topServices.map(([name, stats], index) => <div key={name} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl bg-black/30 p-4"><span className="grid h-8 w-8 place-items-center rounded-lg bg-orange-500/15 text-xs font-black text-orange-300">{index + 1}</span><div className="min-w-0"><p className="truncate text-sm font-bold text-white">{name}</p><p className="text-xs capitalize text-slate-500">{stats.platform} · {stats.orders} order{stats.orders === 1 ? "" : "s"}</p></div><p className="text-sm font-black text-white">{money(stats.revenue)}</p></div>)}</div> : <p className="mt-5 rounded-xl border border-dashed border-white/15 p-8 text-center text-slate-400">No paid orders in this range.</p>}
      </article>

      <article className="rounded-2xl border border-orange-400/20 bg-gradient-to-br from-orange-500/10 to-transparent p-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-300">Phase 1 targets</p>
        <h2 className="mt-2 text-xl font-black text-white">What we improve next</h2>
        <div className="mt-5 space-y-3 text-sm">
          {[
            ["Payment success", "95%+", pct(paymentStarts, paymentCompletions)],
            ["Average order value", "₹1,500+", money(aov)],
            ["Refund rate", "<5%", `${refundRate.toFixed(1)}%`],
            ["Repeat orders", "25%+", pct(completedOrders.length, repeatOrders)],
          ].map(([label, target, current]) => <div key={label} className="rounded-xl bg-black/25 p-4"><div className="flex items-center justify-between gap-3"><span className="font-bold text-white">{label}</span><span className="text-slate-300">Current: {current}</span></div><p className="mt-1 text-xs text-orange-300">Target: {target}</p></div>)}
        </div>
      </article>
    </section>
  </div></main>;
}
