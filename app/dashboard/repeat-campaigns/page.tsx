import Link from "next/link";
import { ArrowLeft, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { getDashboardContext } from "@/lib/auth/dashboard-context";
import { customerOrderServices } from "@/lib/order-service-experience";
import { buildFrequentRepeatPatterns, buildRepeatOrderVariantHref } from "@/lib/cro/repeat-order";
import RepeatCampaignCard from "@/components/dashboard/RepeatCampaignCard";

type Row={id:string;service_name:string|null;platform:string|null;link:string|null;quantity:number|null;status:string|null;created_at:string};

export default async function RepeatCampaignsPage(){
  const {supabase,user}=await getDashboardContext();
  const {data}=await supabase.from("orders")
    .select("id,service_name,platform,link,quantity,status,created_at")
    .eq("user_id",user!.id)
    .eq("status","completed")
    .order("created_at",{ascending:false})
    .limit(60);
  const rows=(data??[]) as Row[];

  const repeatable=rows.flatMap(row=>{
    const serviceName=row.service_name||"";
    const platform=row.platform||"";
    const link=row.link||"";
    const quantity=Number(row.quantity||0);
    const input={serviceName,platform,quantity,link};
    const sameTargetHref=buildRepeatOrderVariantHref(input,customerOrderServices,true);
    const newTargetHref=buildRepeatOrderVariantHref(input,customerOrderServices,false);
    if(!sameTargetHref||!newTargetHref)return [];
    return [{...row,serviceName,platform,link,quantity,sameTargetHref,newTargetHref}];
  });

  const frequent=buildFrequentRepeatPatterns(
    rows.map(row=>({serviceName:row.service_name||"",platform:row.platform||"",quantity:Number(row.quantity||0),link:row.link||"",createdAt:row.created_at})),
    customerOrderServices,2,6
  );

  return <main className="min-h-[calc(100vh-5rem)] bg-[radial-gradient(circle_at_top_left,rgba(255,122,0,.14),transparent_32%),#050505] px-4 pb-14 pt-5 text-white sm:px-6 lg:px-8">
    <div className="mx-auto max-w-[1450px]">
      <Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-orange-300"><ArrowLeft className="h-4 w-4"/>Dashboard</Link>
      <header className="mt-3 overflow-hidden rounded-3xl border border-orange-400/20 bg-[linear-gradient(135deg,rgba(255,122,0,.12),rgba(17,17,17,.98)_52%)] p-5 sm:p-7">
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">Phase 8B · Repeat campaigns</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Repeat a proven campaign without rebuilding it.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">Choose the same completed target or keep the service and quantity while entering a new target. Every repeat opens in review mode and uses current service facts before checkout.</p>
        <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-bold"><span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-emerald-200">No automatic orders</span><span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2 text-slate-300">Current price rechecked</span><span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2 text-slate-300">Target remains reviewable</span></div>
      </header>

      {frequent.length?<section className="mt-5 rounded-3xl border border-emerald-400/15 bg-emerald-500/[.04] p-5 sm:p-6">
        <div className="flex items-start gap-3"><Sparkles className="mt-0.5 h-5 w-5 text-emerald-300"/><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-emerald-300">Frequent patterns</p><h2 className="mt-1 text-xl font-black">Campaigns you have completed more than once</h2><p className="mt-1 text-xs leading-5 text-slate-400">Patterns are based only on exact service + quantity + target matches. No recurrence schedule is assumed.</p></div></div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">{frequent.map(pattern=>{
          const url=new URL(pattern.href,"https://example.test");
          const target=url.searchParams.get("link")||"";
          const newTargetHref=buildRepeatOrderVariantHref({serviceName:pattern.serviceName,platform:pattern.platform,quantity:pattern.quantity,link:target},customerOrderServices,false);
          if(!newTargetHref)return null;
          return <RepeatCampaignCard key={pattern.href} serviceName={pattern.serviceName} platform={pattern.platform} quantity={pattern.quantity} target={target} completedAt={pattern.latestAt} sameTargetHref={pattern.href} newTargetHref={newTargetHref} source="repeat_campaigns_frequent" repeatCount={pattern.count}/>;
        })}</div>
      </section>:null}

      <section className="mt-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Recent completed campaigns</p><h2 className="mt-1 text-2xl font-black">Ready to repeat</h2><p className="mt-1 text-xs text-slate-400">{repeatable.length} eligible completed {repeatable.length===1?"campaign":"campaigns"} found in your recent history.</p></div><Link href="/dashboard/order-history" className="text-xs font-black text-orange-300">Open full order history →</Link></div>
        {repeatable.length?<div className="mt-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">{repeatable.slice(0,12).map(item=><RepeatCampaignCard key={item.id} serviceName={item.serviceName} platform={item.platform} quantity={item.quantity} target={item.link} completedAt={item.created_at} sameTargetHref={item.sameTargetHref} newTargetHref={item.newTargetHref} source="repeat_campaigns_recent"/>)}</div>:<div className="mt-5 rounded-3xl border border-dashed border-white/10 p-8 text-center"><RotateCcw className="mx-auto h-8 w-8 text-orange-300"/><h3 className="mt-3 font-black">No repeatable completed campaign yet</h3><p className="mt-2 text-sm text-slate-400">Once a compatible campaign completes, it can appear here for a faster reviewed repeat flow.</p><Link href="/dashboard/new-order" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-orange-500 px-5 text-sm font-black">Start a new campaign</Link></div>}
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-[#101116] p-4 sm:p-5"><div className="flex items-start gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-300"/><div><h2 className="text-sm font-black">Repeat-order safety</h2><p className="mt-1 text-xs leading-5 text-slate-400">A repeat action only pre-fills the order builder. It never reuses a historical charge as the final price, never submits automatically, and never bypasses current service availability or checkout review.</p></div></div></section>
    </div>
  </main>;
}
