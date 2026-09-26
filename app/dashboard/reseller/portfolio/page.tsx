import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarClock, CircleDollarSign, RefreshCw, TrendingUp, UsersRound } from "lucide-react";
import { getDashboardContext } from "@/lib/auth/dashboard-context";
import { revenueBundlesForPlatform, resolveRevenueBundle } from "@/lib/cro/revenue-bundles";
import { platformMeta, smmServiceCatalog, type SmmPlatformId } from "@/lib/smm-service-catalog";
import { renewalEconomicsAtSavedQuote, renewalStatus } from "@/lib/reseller/portfolio";
import type { SavedMonthlyPlanSnapshot } from "@/lib/reseller/saved-monthly-plan";

const supportedPlatforms = new Set<SmmPlatformId>(["instagram","youtube","linkedin","x","tiktok","telegram"]);
const money = (value:number) => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(value);

function statusCopy(status: ReturnType<typeof renewalStatus>) {
  if (status.status === "overdue") return { label: Math.abs(status.daysUntil || 0) + "d overdue", cls: "border-red-400/20 bg-red-500/[.07] text-red-100" };
  if (status.status === "today") return { label: "Review today", cls: "border-orange-400/25 bg-orange-500/[.08] text-orange-100" };
  if (status.status === "due_soon") return { label: "Due in " + status.daysUntil + "d", cls: "border-amber-400/20 bg-amber-500/[.07] text-amber-100" };
  if (status.status === "scheduled") return { label: "In " + status.daysUntil + "d", cls: "border-white/10 bg-white/[.03] text-slate-300" };
  return { label: "No review date", cls: "border-white/10 bg-white/[.03] text-slate-400" };
}

export default async function AgencyPortfolioPage() {
  const { supabase, user } = await getDashboardContext();
  const userId = user!.id;
  const today = new Date().toISOString().slice(0,10);
  const since30 = new Date(Date.now() - 30 * 864e5).toISOString();

  const [{ data: plans }, { data: clients }, { data: orders }] = await Promise.all([
    supabase.from("reseller_monthly_plans").select("id,name,client_id,campaign_id,platform,bundle_id,markup_percent,baseline_fulfillment_cost,baseline_client_quote,baseline_gross_margin,next_review_on,updated_at").eq("user_id",userId).order("next_review_on",{ascending:true,nullsFirst:false}),
    supabase.from("customer_clients").select("id,name").eq("user_id",userId).is("archived_at",null),
    supabase.from("orders").select("id,client_id,status,charge,created_at").eq("user_id",userId).gte("created_at",since30).order("created_at",{ascending:false}).limit(1000),
  ]);

  const clientNames = new Map((clients||[]).map(client=>[client.id,client.name]));
  const fulfilled30ByClient = new Map<string,number>();
  let fulfilled30 = 0;
  for (const order of orders||[]) {
    if (order.status !== "completed") continue;
    const charge = Number(order.charge||0);
    fulfilled30 += charge;
    if (order.client_id) fulfilled30ByClient.set(order.client_id,(fulfilled30ByClient.get(order.client_id)||0)+charge);
  }

  const planRows = (plans||[]).map(plan=>{
    const platform = supportedPlatforms.has(plan.platform as SmmPlatformId) ? plan.platform as SmmPlatformId : null;
    const bundle = platform ? revenueBundlesForPlatform(platform).find(item=>item.id===plan.bundle_id) : null;
    const resolved = bundle ? resolveRevenueBundle(bundle,smmServiceCatalog) : null;
    const snapshot: SavedMonthlyPlanSnapshot = {
      baselineFulfillmentCost:Number(plan.baseline_fulfillment_cost||0),
      baselineClientQuote:Number(plan.baseline_client_quote||0),
      baselineGrossMargin:Number(plan.baseline_gross_margin||0),
      markupPercent:Number(plan.markup_percent||0),
    };
    const currentCost = resolved ? resolved.total : snapshot.baselineFulfillmentCost;
    const economics = renewalEconomicsAtSavedQuote(snapshot,currentCost);
    const renewal = renewalStatus(plan.next_review_on,today);
    return { plan, platform, resolved, snapshot, currentCost, economics, renewal };
  });

  const plannedValue = planRows.reduce((sum,row)=>sum+row.snapshot.baselineClientQuote,0);
  const currentCost = planRows.reduce((sum,row)=>sum+row.currentCost,0);
  const marginAtSavedQuotes = planRows.reduce((sum,row)=>sum+row.economics.marginAtSavedQuote,0);
  const dueNow = planRows.filter(row=>row.renewal.status==="overdue"||row.renewal.status==="today").length;
  const dueSoon = planRows.filter(row=>row.renewal.status==="due_soon").length;
  const unscheduled = planRows.filter(row=>row.renewal.status==="unscheduled").length;
  const renewalPipeline = [...planRows].sort((a,b)=>{
    const rank=(value:ReturnType<typeof renewalStatus>)=>value.status==="overdue"?0:value.status==="today"?1:value.status==="due_soon"?2:value.status==="scheduled"?3:4;
    const diff=rank(a.renewal)-rank(b.renewal);
    if(diff!==0)return diff;
    return (a.renewal.daysUntil??99999)-(b.renewal.daysUntil??99999);
  });
  const costRisks = planRows.filter(row=>row.currentCost>row.snapshot.baselineFulfillmentCost).sort((a,b)=>(b.currentCost-b.snapshot.baselineFulfillmentCost)-(a.currentCost-a.snapshot.baselineFulfillmentCost));

  const portfolio = new Map<string,{id:string|null;name:string;planned:number;cost:number;margin:number;plans:number;due:number;risks:number;fulfilled30:number}>();
  for(const row of planRows){
    const key=row.plan.client_id||"__general__";
    const current=portfolio.get(key)||{id:row.plan.client_id,name:row.plan.client_id?(clientNames.get(row.plan.client_id)||"Client workspace"):"General / unassigned",planned:0,cost:0,margin:0,plans:0,due:0,risks:0,fulfilled30:row.plan.client_id?(fulfilled30ByClient.get(row.plan.client_id)||0):0};
    current.planned+=row.snapshot.baselineClientQuote;
    current.cost+=row.currentCost;
    current.margin+=row.economics.marginAtSavedQuote;
    current.plans+=1;
    if(row.renewal.status==="overdue"||row.renewal.status==="today")current.due+=1;
    if(row.currentCost>row.snapshot.baselineFulfillmentCost)current.risks+=1;
    portfolio.set(key,current);
  }
  const clientPortfolio=[...portfolio.values()].sort((a,b)=>b.planned-a.planned);

  return <main className="dashboard-premium-page mx-auto w-full max-w-[1550px] px-4 pb-12 pt-5 text-white sm:px-6 lg:px-8">
    <section className="overflow-hidden rounded-[1.6rem] border border-orange-400/20 bg-[radial-gradient(circle_at_top_right,rgba(255,153,0,.18),transparent_34%),linear-gradient(125deg,#17150f,#0f1117_62%)] p-5 sm:p-7 lg:p-8">
      <div className="grid gap-7 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
        <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">Agency portfolio + renewal pipeline</p><h1 className="mt-3 max-w-4xl text-3xl font-black tracking-[-.035em] sm:text-4xl lg:text-5xl">Know which client plans need attention before margin or renewals slip.</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">This dashboard combines saved monthly plans with current catalog cost and recent completed-order value. Planned monthly quoted value is a planning figure—not guaranteed subscription revenue.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/dashboard/reseller/monthly-plans" className="btn-dashboard-primary inline-flex min-h-12 items-center gap-2 px-5 text-sm">Review saved plans <RefreshCw className="h-4 w-4"/></Link><Link href="/dashboard/reseller/monthly-planner" className="btn-dashboard-secondary inline-flex min-h-12 items-center gap-2 px-5 text-sm">Build monthly plan <ArrowRight className="h-4 w-4"/></Link><Link href="/dashboard/reseller" className="btn-dashboard-secondary inline-flex min-h-12 items-center px-5 text-sm">Reseller Hub</Link></div></div>
        <aside className="rounded-2xl border border-white/10 bg-black/25 p-5"><p className="text-[10px] font-black uppercase tracking-[.14em] text-slate-400">30-day fulfilled value</p><p className="mt-2 text-3xl font-black">{money(fulfilled30)}</p><p className="mt-3 text-xs leading-5 text-slate-400">Actual completed-order value from the last 30 days, shown separately from saved monthly client quotes.</p></aside>
      </div>
    </section>

    <section className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
      {[
        ["Planned monthly quoted value",money(plannedValue),CircleDollarSign],
        ["Current fulfillment cost",money(currentCost),TrendingUp],
        ["Margin at saved client quotes",money(marginAtSavedQuotes),AlertTriangle],
        ["Renewals due now",String(dueNow),CalendarClock],
      ].map(([label,value,Icon])=>{const StatIcon=Icon as typeof CircleDollarSign;return <article key={String(label)} className="rounded-2xl border border-white/10 bg-[#101116] p-4 sm:p-5"><div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.13em] text-slate-500"><StatIcon className="h-4 w-4 text-orange-300"/>{String(label)}</div><p className="mt-2 text-xl font-black sm:text-2xl">{String(value)}</p></article>})}
    </section>

    <section className="mt-5 dashboard-glass p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-orange-300">Renewal pipeline</p><h2 className="mt-1 text-2xl font-black">Plans requiring review</h2><p className="mt-2 text-sm text-slate-400">{dueNow} due now · {dueSoon} due within 7 days · {unscheduled} without a review date.</p></div><Link href="/dashboard/reseller/monthly-plans" className="text-sm font-black text-orange-300">All saved plans →</Link></div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">{renewalPipeline.length?renewalPipeline.slice(0,8).map(row=>{const status=statusCopy(row.renewal);return <article key={row.plan.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[.12em] text-slate-500">{row.platform?platformMeta[row.platform].label:"Saved plan"} · {row.plan.markup_percent}% markup</p><h3 className="mt-1 truncate text-lg font-black">{row.plan.name}</h3><p className="mt-1 text-xs text-slate-400">{row.plan.client_id?(clientNames.get(row.plan.client_id)||"Client workspace"):"General / unassigned"}</p></div><span className={"shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black "+status.cls}>{status.label}</span></div><div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-xl bg-white/[.035] p-3"><span className="text-[9px] text-slate-500">Client fee</span><b className="mt-1 block text-sm">{money(row.snapshot.baselineClientQuote)}</b></div><div className="rounded-xl bg-white/[.035] p-3"><span className="text-[9px] text-slate-500">Current cost</span><b className="mt-1 block text-sm">{money(row.currentCost)}</b></div><div className="rounded-xl bg-white/[.035] p-3"><span className="text-[9px] text-slate-500">Margin now</span><b className="mt-1 block text-sm">{money(row.economics.marginAtSavedQuote)}</b></div></div><Link href={"/dashboard/reseller/monthly-planner?plan="+encodeURIComponent(row.plan.id)} className="mt-4 inline-flex items-center gap-2 text-xs font-black text-orange-300">Review renewal <ArrowRight className="h-3.5 w-3.5"/></Link></article>}):<div className="rounded-2xl border border-dashed border-white/10 p-8 text-center lg:col-span-2"><CalendarClock className="mx-auto h-8 w-8 text-orange-300"/><h3 className="mt-3 font-black">No saved monthly plans yet</h3><p className="mt-2 text-sm text-slate-400">Save a monthly plan to start building a real renewal pipeline.</p></div>}</div>
    </section>

    <section className="mt-5 grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
      <article className="dashboard-glass p-5 sm:p-6"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-orange-300">Client portfolio</p><h2 className="mt-1 text-2xl font-black">Highest planned client value</h2><p className="mt-2 text-sm text-slate-400">Sorted by saved monthly client quotes. Completed 30-day value is shown separately.</p></div><div className="mt-5 space-y-3">{clientPortfolio.length?clientPortfolio.slice(0,8).map(client=><div key={client.id||"general"} className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-black">{client.name}</h3><p className="mt-1 text-xs text-slate-400">{client.plans} saved plan{client.plans===1?"":"s"} · {client.due} due now · {client.risks} cost risk{client.risks===1?"":"s"}</p></div><b className="text-lg">{money(client.planned)}</b></div><div className="mt-3 grid grid-cols-3 gap-2 text-xs"><div><span className="text-slate-500">Current cost</span><b className="mt-1 block">{money(client.cost)}</b></div><div><span className="text-slate-500">Margin now</span><b className="mt-1 block">{money(client.margin)}</b></div><div><span className="text-slate-500">30-day fulfilled</span><b className="mt-1 block">{money(client.fulfilled30)}</b></div></div>{client.id?<Link href={"/dashboard/clients/"+encodeURIComponent(client.id)} className="mt-3 inline-flex text-xs font-black text-orange-300">Open client →</Link>:null}</div>):<p className="text-sm text-slate-400">No client-linked saved plans yet.</p>}</div></article>

      <article className="dashboard-glass p-5 sm:p-6"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-orange-300">Margin watch</p><h2 className="mt-1 text-2xl font-black">Plans where fulfillment cost increased</h2><p className="mt-2 text-sm text-slate-400">If you keep the old client fee, these plans have lower gross margin than when saved.</p></div><div className="mt-5 space-y-3">{costRisks.length?costRisks.slice(0,8).map(row=>{const increase=row.currentCost-row.snapshot.baselineFulfillmentCost;return <div key={row.plan.id} className="rounded-2xl border border-amber-400/15 bg-amber-500/[.045] p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-black">{row.plan.name}</h3><p className="mt-1 text-xs text-slate-400">{row.plan.client_id?(clientNames.get(row.plan.client_id)||"Client workspace"):"General / unassigned"}</p></div><span className="text-xs font-black text-amber-200">+{money(increase)}</span></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><div><span className="text-slate-500">Margin at old client fee</span><b className="mt-1 block">{money(row.economics.marginAtSavedQuote)} · {row.economics.marginAtSavedQuotePercent}%</b></div><div><span className="text-slate-500">Quote to restore markup</span><b className="mt-1 block">{money(row.economics.recommendedQuote)}</b></div></div><Link href={"/dashboard/reseller/monthly-planner?plan="+encodeURIComponent(row.plan.id)} className="mt-3 inline-flex text-xs font-black text-orange-300">Review pricing →</Link></div>}):<div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/[.045] p-5 text-sm text-emerald-100">No saved plan currently shows a higher static-catalog fulfillment cost than its saved baseline.</div>}</div></article>
    </section>

    <p className="mt-5 text-[10px] leading-4 text-slate-500">Portfolio values are planning and operational figures. Saved client quotes do not create subscriptions, invoices, automatic renewals or charges. Final service availability and checkout price remain authoritative.</p>
  </main>;
}
