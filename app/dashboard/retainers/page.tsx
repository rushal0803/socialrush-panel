import Link from "next/link";
import { ArrowRight, CalendarRange, Repeat2, Sparkles, TrendingUp, Users } from "lucide-react";
import { getDashboardContext } from "@/lib/auth/dashboard-context";

const completedStatuses = new Set(["completed"]);
const activeStatuses = new Set(["pending", "processing", "in_progress", "partial", "refill_requested", "refilling"]);

export default async function RetainersPage() {
  const { supabase, user } = await getDashboardContext();
  const userId = user!.id;
  const since90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: clients }, { data: orders }] = await Promise.all([
    supabase.from("customer_clients").select("id,name,created_at").eq("user_id", userId).is("archived_at", null).order("created_at", { ascending: false }),
    supabase.from("orders").select("id,client_id,status,charge,created_at,service_name,platform,quantity,link").eq("user_id", userId).gte("created_at", since90).order("created_at", { ascending: false }).limit(1000),
  ]);

  const clientRows = (clients || []).map((client) => {
    const clientOrders = (orders || []).filter((order) => order.client_id === client.id);
    const completed = clientOrders.filter((order) => completedStatuses.has(order.status || ""));
    const active = clientOrders.filter((order) => activeStatuses.has(order.status || ""));
    const last30 = clientOrders.filter((order) => order.created_at >= since30);
    const spend90 = completed.reduce((sum, order) => sum + Number(order.charge || 0), 0);
    const spend30 = last30.filter((order) => completedStatuses.has(order.status || "")).reduce((sum, order) => sum + Number(order.charge || 0), 0);
    const recent = completed[0] || clientOrders[0] || null;
    const repeatScore = completed.length >= 3 ? "High" : completed.length >= 2 ? "Warm" : "Build";
    return { client, clientOrders, completed, active, spend90, spend30, recent, repeatScore };
  });

  const candidates = clientRows.filter((row) => row.completed.length >= 2 || row.spend90 >= 3000).sort((a, b) => (b.completed.length * 100000 + b.spend90) - (a.completed.length * 100000 + a.spend90));
  const monthlyRunRate = clientRows.reduce((sum, row) => sum + row.spend30, 0);
  const repeatClients = clientRows.filter((row) => row.completed.length >= 2).length;

  return <main className="dashboard-premium-page mx-auto w-full max-w-[1500px] px-4 pb-12 pt-5 text-white sm:px-6 lg:px-8">
    <section className="overflow-hidden rounded-[1.6rem] border border-orange-400/20 bg-[radial-gradient(circle_at_top_right,rgba(255,153,0,.18),transparent_34%),linear-gradient(125deg,#17150f,#0f1117_62%)] p-5 sm:p-7 lg:p-8">
      <div className="grid gap-7 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
        <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">Recurring revenue center</p><h1 className="mt-3 max-w-3xl text-3xl font-black tracking-[-.035em] sm:text-4xl lg:text-5xl">Turn repeat orders into monthly client retainers.</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">Use real client order history to identify the accounts most likely to renew. This workspace does not auto-charge anyone; it helps you plan, quote and repeat client work using current live service pricing.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row"><Link href="/dashboard/clients" className="btn-dashboard-primary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm">Manage clients <ArrowRight className="h-4 w-4"/></Link><Link href="/dashboard/campaign-stacks" className="btn-dashboard-secondary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm">Build monthly stack <Sparkles className="h-4 w-4"/></Link></div></div>
        <aside className="rounded-2xl border border-white/10 bg-black/25 p-5"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-500/10 text-orange-300"><TrendingUp className="h-5 w-5"/></span><div><p className="text-xs font-black uppercase tracking-[.12em] text-slate-400">30-day fulfilled value</p><p className="mt-1 text-2xl font-black">₹{monthlyRunRate.toLocaleString("en-IN")}</p></div></div><p className="mt-4 text-sm leading-6 text-slate-400">Use this as a working baseline for client revenue already flowing through completed orders—not a guaranteed future subscription value.</p></aside>
      </div>
    </section>

    <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[["Active clients", clientRows.length, Users], ["Repeat clients", repeatClients, Repeat2], ["Retainer candidates", candidates.length, CalendarRange], ["30-day value", `₹${monthlyRunRate.toLocaleString("en-IN")}`, TrendingUp]].map(([label,value,Icon]) => { const StatIcon = Icon as typeof Users; return <article key={String(label)} className="rounded-2xl border border-white/10 bg-[#101116] p-4"><div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.13em] text-slate-400"><StatIcon className="h-4 w-4 text-orange-300"/>{String(label)}</div><p className="mt-2 text-2xl font-black">{String(value)}</p></article>; })}
    </section>

    <section className="mt-5 dashboard-glass p-5 sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-orange-300">Renewal pipeline</p><h2 className="mt-1 text-2xl font-black">Best clients to approach for monthly work</h2><p className="mt-2 text-sm text-slate-400">Candidates are based on completed order frequency and recent fulfilled spend.</p></div><Link href="/dashboard/reseller" className="text-sm font-black text-orange-300">Open reseller workflow →</Link></div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">{candidates.length ? candidates.map(({ client, completed, active, spend90, spend30, recent, repeatScore }) => <article key={client.id} className="rounded-2xl border border-white/10 bg-black/20 p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.12em] text-slate-500">{repeatScore} renewal signal</p><Link href={`/dashboard/clients/${client.id}`} className="mt-1 block text-xl font-black hover:text-orange-200">{client.name}</Link></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${repeatScore === "High" ? "bg-emerald-500/10 text-emerald-200" : "bg-orange-500/10 text-orange-200"}`}>{completed.length} completed</span></div><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-white/[.035] p-3"><b className="block text-base">₹{spend30.toLocaleString("en-IN")}</b><span className="text-[10px] text-slate-400">30-day</span></div><div className="rounded-xl bg-white/[.035] p-3"><b className="block text-base">₹{spend90.toLocaleString("en-IN")}</b><span className="text-[10px] text-slate-400">90-day</span></div><div className="rounded-xl bg-white/[.035] p-3"><b className="block text-base">{active.length}</b><span className="text-[10px] text-slate-400">Active now</span></div></div>{recent ? <p className="mt-4 text-xs leading-5 text-slate-400">Recent service: <span className="font-bold text-slate-200">{recent.service_name || recent.platform || "Growth service"}</span></p> : null}<div className="mt-4 flex flex-wrap gap-2"><Link href={`/dashboard/new-campaign?client=${client.id}`} className="btn-dashboard-primary inline-flex min-h-10 items-center gap-2 px-3 text-xs"><CalendarRange className="h-3.5 w-3.5"/>Create monthly campaign</Link>{recent?.service_name ? <Link href={`/dashboard/new-order?client=${client.id}`} className="btn-dashboard-secondary inline-flex min-h-10 items-center gap-2 px-3 text-xs"><Repeat2 className="h-3.5 w-3.5"/>Start renewal order</Link> : null}</div></article>) : <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center lg:col-span-2"><Repeat2 className="mx-auto h-8 w-8 text-orange-300"/><h3 className="mt-3 font-black">No strong retainer candidates yet</h3><p className="mt-1 text-sm text-slate-400">Keep client orders linked to client workspaces. Candidates appear automatically as repeat history builds.</p></div>}</div>
    </section>

    <section className="mt-5 grid gap-4 lg:grid-cols-3">{[["1. Pick the account","Prioritize clients with repeat completed orders or meaningful recent spend."],["2. Build the monthly scope","Use Campaign Stacks or current live services to define a realistic recurring service mix."],["3. Renew manually","Confirm the client each cycle, review current pricing, then place normal orders. No silent auto-charging."]].map(([title,text]) => <article key={title} className="rounded-2xl border border-white/10 bg-[#101116] p-5"><h3 className="font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></article>)}</section>
  </main>;
}
