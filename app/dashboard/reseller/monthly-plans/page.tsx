import Link from "next/link";
import { ArrowRight, BookmarkCheck, CircleDollarSign, RefreshCw } from "lucide-react";
import { getDashboardContext } from "@/lib/auth/dashboard-context";
import { revenueBundlesForPlatform, resolveRevenueBundle } from "@/lib/cro/revenue-bundles";
import { platformMeta, smmServiceCatalog, type SmmPlatformId } from "@/lib/smm-service-catalog";
import { compareSavedMonthlyPlan } from "@/lib/reseller/saved-monthly-plan";

const supportedPlatforms = new Set<SmmPlatformId>(["instagram","youtube","linkedin","x","tiktok","telegram"]);
const money = (value:number) => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(value);

export default async function SavedMonthlyPlansPage(){
  const { supabase, user } = await getDashboardContext();
  const [{ data: plans }, { data: clients }, { data: campaigns }] = await Promise.all([
    supabase.from("reseller_monthly_plans").select("id,name,client_id,campaign_id,platform,bundle_id,markup_percent,baseline_fulfillment_cost,baseline_client_quote,baseline_gross_margin,created_at,updated_at").eq("user_id",user!.id).order("updated_at",{ascending:false}),
    supabase.from("customer_clients").select("id,name").eq("user_id",user!.id),
    supabase.from("campaigns").select("id,name").eq("user_id",user!.id),
  ]);
  const clientNames = new Map((clients||[]).map(row=>[row.id,row.name]));
  const campaignNames = new Map((campaigns||[]).map(row=>[row.id,row.name]));
  const rows = (plans||[]).map(plan=>{
    const platform = supportedPlatforms.has(plan.platform as SmmPlatformId) ? plan.platform as SmmPlatformId : null;
    const bundle = platform ? revenueBundlesForPlatform(platform).find(item=>item.id===plan.bundle_id) : null;
    const resolved = bundle ? resolveRevenueBundle(bundle,smmServiceCatalog) : null;
    const comparison = resolved ? compareSavedMonthlyPlan({
      baselineFulfillmentCost:Number(plan.baseline_fulfillment_cost||0),
      baselineClientQuote:Number(plan.baseline_client_quote||0),
      baselineGrossMargin:Number(plan.baseline_gross_margin||0),
      markupPercent:Number(plan.markup_percent||0),
    },resolved.total) : null;
    return { plan, platform, resolved, comparison };
  });
  return <main className="dashboard-premium-page mx-auto w-full max-w-[1500px] px-4 pb-12 pt-5 text-white sm:px-6 lg:px-8">
    <header className="rounded-[1.6rem] border border-orange-400/20 bg-[radial-gradient(circle_at_top_right,rgba(255,153,0,.16),transparent_34%),linear-gradient(125deg,#17150f,#0f1117_62%)] p-5 sm:p-7">
      <p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">Fast monthly renewal</p>
      <div className="mt-2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><h1 className="text-3xl font-black sm:text-4xl">Saved monthly plans</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Reopen last month’s client scope, compare the saved fulfillment baseline with current catalog pricing, then review each renewal order before payment.</p></div><div className="flex flex-wrap gap-2"><Link href="/dashboard/reseller/monthly-planner" className="btn-dashboard-primary inline-flex min-h-11 items-center gap-2 px-4 text-xs"><CircleDollarSign className="h-4 w-4"/>Build new plan</Link><Link href="/dashboard/reseller" className="btn-dashboard-secondary inline-flex min-h-11 items-center px-4 text-xs">Reseller Hub</Link></div></div>
    </header>
    <section className="mt-5 grid gap-4 lg:grid-cols-2">{rows.length?rows.map(({plan,platform,resolved,comparison})=>{
      const delta = comparison?.costDelta || 0;
      const deltaLabel = delta===0?"No cost change":delta>0?"Cost +"+money(delta):"Cost -"+money(Math.abs(delta));
      return <article key={plan.id} className="dashboard-glass p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[.13em] text-orange-300">{platform?platformMeta[platform].label:"Saved plan"} · {Number(plan.markup_percent||0)}% markup</p><h2 className="mt-1 truncate text-xl font-black">{plan.name}</h2><p className="mt-1 text-xs text-slate-400">{plan.client_id?(clientNames.get(plan.client_id)||"Client workspace"):"General plan"}{plan.campaign_id?" · "+(campaignNames.get(plan.campaign_id)||"Campaign"):""}</p></div><BookmarkCheck className="h-5 w-5 shrink-0 text-emerald-300"/></div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"><div className="rounded-xl bg-white/[.035] p-3"><span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Saved cost</span><b className="mt-1 block">{money(Number(plan.baseline_fulfillment_cost||0))}</b></div><div className="rounded-xl bg-white/[.035] p-3"><span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Current cost</span><b className="mt-1 block">{resolved?money(resolved.total):"Review"}</b></div><div className="rounded-xl bg-white/[.035] p-3"><span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Current quote</span><b className="mt-1 block">{comparison?money(comparison.current.clientQuote):"Review"}</b></div><div className="rounded-xl bg-white/[.035] p-3"><span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Current margin</span><b className="mt-1 block">{comparison?money(comparison.current.grossMargin):"Review"}</b></div></div>
        <div className={"mt-4 rounded-xl border p-3 text-xs "+(delta>0?"border-amber-400/20 bg-amber-500/[.06] text-amber-100":delta<0?"border-emerald-400/20 bg-emerald-500/[.06] text-emerald-100":"border-white/10 bg-white/[.025] text-slate-300")}><b>{deltaLabel}</b>{comparison&&comparison.costDeltaPercent!==0?" · "+(comparison.costDeltaPercent>0?"+":"")+comparison.costDeltaPercent+"% vs saved baseline":""}{!resolved?" · The saved stack is no longer available in the current static catalog. Reopen to review alternatives.":""}</div>
        <div className="mt-4 flex flex-wrap gap-2"><Link href={"/dashboard/reseller/monthly-planner?plan="+encodeURIComponent(plan.id)} className="btn-dashboard-primary inline-flex min-h-11 items-center gap-2 px-4 text-xs"><RefreshCw className="h-4 w-4"/>Reopen & renew <ArrowRight className="h-3.5 w-3.5"/></Link>{plan.client_id?<Link href={"/dashboard/clients/"+encodeURIComponent(plan.client_id)} className="btn-dashboard-secondary inline-flex min-h-11 items-center px-4 text-xs">Client workspace</Link>:null}</div>
        <p className="mt-3 text-[10px] leading-4 text-slate-500">Saved baseline: {new Date(plan.updated_at).toLocaleDateString("en-IN")}. No order or charge happens from this page.</p>
      </article>
    }):<div className="dashboard-glass p-10 text-center lg:col-span-2"><BookmarkCheck className="mx-auto h-8 w-8 text-orange-300"/><h2 className="mt-3 font-black">No saved monthly plans yet</h2><p className="mt-2 text-sm text-slate-400">Build a monthly plan, set your markup, then save the baseline for next month’s renewal.</p><Link href="/dashboard/reseller/monthly-planner" className="btn-dashboard-primary mt-5 inline-flex min-h-11 items-center px-4 text-xs">Build first plan</Link></div>}</section>
  </main>;
}
