import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const ranges = { today: 1, "7d": 7, "30d": 30, "90d": 90 } as const;
const funnel = ["new_order_started", "platform_selected", "service_selected", "campaign_details_started", "order_summary_viewed", "order_confirmation_started", "order_created"] as const;
const pct = (from: number, to: number) => from ? `${((to / from) * 100).toFixed(1)}%` : "—";
const money = (value: number) => value.toLocaleString("en-IN", { style: "currency", currency: "INR" });

export default async function Page({ searchParams }: { searchParams: { range?: string } }) {
  const db = await createClient();
  const key = searchParams.range && searchParams.range in ranges ? searchParams.range as keyof typeof ranges : "30d";
  const since = new Date(Date.now() - ranges[key] * 86_400_000).toISOString();
  const [analyticsResult, ordersResult, transactionsResult, supportResult] = await Promise.all([
    db.from("analytics_events").select("event_name,customer_id,anonymous_session_id,platform,service_code,device_category,source,medium,campaign,created_at").gte("created_at", since),
    db.from("orders").select("id,user_id,charge,status,payment_status,created_at").gte("created_at", since),
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
  const created = orders.filter((order) => order.status !== "failed" && order.status !== "cancelled").length;
  const starts = count("new_order_started");
  const payments = transactions.filter((transaction) => transaction.type === "credit");
  const paymentSuccess = payments.filter((transaction) => transaction.status === "completed").length;
  const completedOrders = orders.filter((order) => order.status === "completed");
  const completedCustomers = new Set(completedOrders.map((order) => order.user_id));
  const repeat = completedCustomers.size ? completedOrders.length - completedCustomers.size : 0;
  const gross = orders.filter((order) => !["failed", "cancelled", "refunded"].includes(order.status) && ["paid", "completed"].includes(order.payment_status || "paid")).reduce((sum, order) => sum + Number(order.charge), 0);
  const refunds = transactions.filter((transaction) => transaction.type === "refund" && transaction.status === "completed").reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const first = events.length ? events.reduce((earliest, event) => earliest < event.created_at ? earliest : event.created_at, events[0].created_at) : null;
  const cards = [["Website visitors", visitors], ["New Order starts", starts], ["Orders created", created], ["Order conversion", pct(starts, created)], ["Payment success", pct(payments.length, paymentSuccess)], ["Add Funds completion", pct(count("add_funds_started"), paymentSuccess)], ["Support tickets", supportCount], ["Repeat-order rate", pct(completedOrders.length, repeat)]];

  return <main className="p-4 pb-24 sm:p-8"><div className="mx-auto max-w-[1500px]">
    <h1 className="text-3xl font-black text-white">Analytics &amp; Conversion</h1>
    <p className="mt-2 text-sm text-slate-400">First-party funnel data and verified business records. Collection started: {first ? new Date(first).toLocaleString("en-IN") : "No events yet"}.</p>
    {queryFailed ? <div role="alert" className="mt-5 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100"><strong>Analytics reports are temporarily unavailable.</strong><p>Analytics data will appear here as customers begin using the website.</p></div> : null}
    <div className="mt-5 flex flex-wrap gap-2">{Object.keys(ranges).map((range) => <Link key={range} href={`?range=${range}`} className={`rounded-xl px-4 py-2 text-xs font-bold ${range === key ? "bg-orange-500 text-white" : "border border-white/10 text-slate-300"}`}>{range === "today" ? "Today" : `Last ${range.slice(0, -1)} days`}</Link>)}</div>
    <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">{cards.map(([label, value]) => <article key={label} className="min-w-0 rounded-2xl border border-white/10 bg-[#111] p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-2 break-words text-2xl font-black text-white">{value}</p></article>)}</section>
    <section className="mt-6 rounded-2xl border border-white/10 bg-[#111] p-5"><h2 className="text-xl font-black text-white">New Order funnel</h2>{events.length ? <ol className="mt-5 grid gap-3 lg:grid-cols-7">{funnel.map((step, index) => { const total = step === "order_created" ? created : count(step); const previous = index ? funnel[index - 1] : null; const previousTotal = previous ? previous === "order_created" ? created : count(previous) : total; return <li key={step} className="rounded-xl bg-black/30 p-4"><p className="break-words text-xs capitalize text-slate-300">{step.replaceAll("_", " ")}</p><p className="mt-2 text-2xl font-black text-white">{total}</p><p className="mt-1 text-xs text-orange-300">{index ? `${pct(previousTotal, total)} continued · ${previousTotal ? pct(previousTotal, previousTotal - total) : "—"} drop-off` : "Entry step"}</p></li>; })}</ol> : <p className="mt-5 rounded-xl border border-dashed border-white/15 p-8 text-center text-slate-400">Analytics data will appear here as customers begin using the website.</p>}</section>
    <section className="mt-6 grid gap-4 sm:grid-cols-3">{[["Revenue", money(gross)], ["Refunds", money(refunds)], ["Average order value", money(created ? gross / created : 0)]].map(([label, value]) => <article key={label} className="rounded-2xl bg-[#111] p-5"><p className="text-xs text-slate-400">{label}</p><p className="mt-2 text-2xl font-black text-white">{value}</p></article>)}</section>
  </div></main>;
}
