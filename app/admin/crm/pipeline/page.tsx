/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { ArrowRight, BadgeDollarSign, CircleCheckBig, Clock3, Flame, RefreshCcw, Target, UsersRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { activeLeadCount, buildLeadStageCounts, customerRevenueSummary, sortSalesOpportunities } from "@/lib/crm/sales-pipeline";
import { date, dateTime, metricsForOrders, money, type CRMLead } from "@/lib/crm/types";

const human=(value:string)=>value.replaceAll("_"," ").replace(/\\b\\w/g,char=>char.toUpperCase());

export default async function SalesPipelinePage(){
  const db=await createClient();
  const now=Date.now();
  const nowIso=new Date(now).toISOString();
  const since30=new Date(now-30*864e5).toISOString();

  const [leadRes,scoreRes,replyFollowRes,inboundRes,profilesRes,ordersRes]=await Promise.all([
    db.from("crm_leads").select("id,business_name,status,priority,score,recommended_service,last_contacted_at,next_action_at,updated_at,created_at").order("updated_at",{ascending:false}).limit(1000),
    db.from("crm_lead_scores").select("lead_id,score,grade,score_reasons,calculated_at").order("score",{ascending:false}).limit(1000),
    db.from("crm_lead_reply_followups").select("id,lead_id,title,due_at,priority,status").eq("status","pending").order("due_at").limit(500),
    db.from("crm_inbound_messages").select("id,lead_id,classification,needs_admin_review,received_at,subject").order("received_at",{ascending:false}).limit(500),
    db.from("profiles").select("id,full_name,email,created_at").neq("role","admin").limit(2000),
    db.from("orders").select("user_id,charge,status,payment_status,platform,created_at").order("created_at",{ascending:false}).limit(12000),
  ]);

  const leads=(leadRes.data||[]) as CRMLead[];
  const scores=(scoreRes.data||[]) as any[];
  const replyFollowups=(replyFollowRes.data||[]) as any[];
  const inbound=(inboundRes.data||[]) as any[];
  const profiles=(profilesRes.data||[]) as any[];
  const orders=(ordersRes.data||[]) as any[];

  const scoreMap=new Map(scores.map(row=>[row.lead_id,row]));
  const latestInbound=new Map<string,any>();
  inbound.forEach(row=>{if(row.lead_id&&!latestInbound.has(row.lead_id))latestInbound.set(row.lead_id,row);});
  const stageCounts=buildLeadStageCounts(leads);
  const activeLeads=activeLeadCount(leads);
  const hot=scores.filter(row=>row.grade==="hot").length;
  const warm=scores.filter(row=>row.grade==="warm").length;
  const replyReview=inbound.filter(row=>row.needs_admin_review).length;
  const dueReplyFollowups=replyFollowups.filter(row=>row.due_at<=nowIso).length;
  const won=leads.filter(lead=>lead.status==="won").length;
  const lost=leads.filter(lead=>lead.status==="lost").length;

  const ordersByUser=new Map<string,any[]>();
  orders.forEach(order=>ordersByUser.set(order.user_id,[...(ordersByUser.get(order.user_id)||[]),order]));
  const customerRows=profiles.map(profile=>{
    const userOrders=ordersByUser.get(profile.id)||[];
    const metrics=metricsForOrders(userOrders);
    const completed=userOrders.filter(order=>order.status==="completed"||order.payment_status==="paid").sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at));
    return {profile,metrics,lastCompletedAt:completed[0]?.created_at||null};
  });
  const customerSummary=customerRevenueSummary(customerRows,now);
  const completed30=orders.filter(order=>(order.status==="completed"||order.payment_status==="paid")&&order.created_at>=since30);
  const revenue30=completed30.reduce((sum,order)=>sum+Number(order.charge||0),0);

  const opportunities=sortSalesOpportunities(leads).filter(lead=>!["won","lost","do_not_contact"].includes(lead.status)).slice(0,10);
  const reactivationCustomers=customerRows.filter(row=>row.metrics.validOrders>0&&row.lastCompletedAt&&now-Date.parse(row.lastCompletedAt)>=21*864e5).sort((a,b)=>b.metrics.totalSpend-a.metrics.totalSpend).slice(0,8);

  const topCards=[
    [Target,"Active lead pipeline",activeLeads,"Current leads from new through qualified"],
    [Flame,"Hot + warm opportunities",hot+warm,hot+" hot · "+warm+" warm"],
    [Clock3,"Reply actions due",dueReplyFollowups+replyReview,dueReplyFollowups+" follow-ups due · "+replyReview+" replies need review"],
    [CircleCheckBig,"Won leads",won,lost+" marked lost"],
  ] as const;

  return <main className="mx-auto max-w-[1650px] p-4 sm:p-8">
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">Phase 8A · Sales machine</p>
        <h1 className="mt-2 text-3xl font-black text-white">Sales Pipeline Command Center</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#9CA3AF]">One operational view for prospecting, active opportunities, reply follow-ups, customer conversion signals and repeat-revenue opportunities. Lead-state and customer-revenue data stay separate unless the database contains a real relationship.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/crm/leads" className="rounded-xl border border-orange-400/30 px-4 py-3 text-xs font-bold text-orange-200">Open leads</Link>
        <Link href="/admin/crm/replies" className="rounded-xl border border-sky-400/30 px-4 py-3 text-xs font-bold text-sky-200">Review replies</Link>
        <Link href="/admin/crm/follow-ups" className="rounded-xl bg-orange-500 px-4 py-3 text-xs font-bold text-white">Follow-ups</Link>
      </div>
    </header>

    <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {topCards.map(([Icon,title,value,helper])=><article key={title} className="rounded-2xl border border-white/10 bg-[#111111] p-5"><div className="flex items-center justify-between"><p className="text-[10px] font-black uppercase tracking-wider text-[#9CA3AF]">{title}</p><Icon size={17} className="text-orange-300"/></div><b className="mt-3 block text-2xl text-white">{value}</b><p className="mt-1 text-[11px] leading-5 text-[#8F949D]">{helper}</p></article>)}
    </section>

    <section className="mt-6 rounded-2xl border border-white/10 bg-[#111111] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Current lead distribution</p><h2 className="mt-1 text-xl font-black text-white">Where the pipeline is sitting now</h2><p className="mt-1 text-xs text-[#9CA3AF]">These are current-state counts, not a cohort conversion-rate calculation.</p></div><Link href="/admin/crm/prospecting" className="text-xs font-black text-orange-200">Open prospecting →</Link></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-9">
        {stageCounts.map(stage=><div key={stage.status} className="rounded-xl border border-white/10 bg-[#0B0B0F] p-3"><p className="text-[9px] font-black uppercase tracking-wide text-[#8F949D]">{human(stage.status)}</p><b className="mt-2 block text-xl text-white">{stage.count}</b></div>)}
      </div>
    </section>

    <section className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
      <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
        <div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-amber-300">Priority opportunities</p><h2 className="mt-1 text-xl font-black text-white">Leads to work next</h2></div><Link href="/admin/crm/leads" className="text-xs font-black text-orange-200">All leads →</Link></div>
        <div className="mt-4 space-y-2">{opportunities.length?opportunities.map(lead=>{const score=scoreMap.get(lead.id);const reply=latestInbound.get(lead.id);const grade=score?.grade?human(String(score.grade)):"Unscored";const details=[human(lead.status),lead.recommended_service,reply?.classification?human(String(reply.classification)):null].filter(Boolean).join(" · ");return <Link key={lead.id} href={"/admin/crm/leads/"+lead.id} className="block rounded-xl border border-white/10 bg-[#0B0B0F] p-4 transition hover:border-orange-400/30"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><b className="block truncate text-sm text-white">{lead.business_name}</b><p className="mt-1 text-xs text-[#9CA3AF]">{details}</p></div><div className="text-right"><span className={score?.grade==="hot"?"rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-black text-red-200":score?.grade==="warm"?"rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-black text-amber-100":"rounded-full bg-white/5 px-2 py-1 text-[10px] font-black text-[#D1D5DB]"}>{grade} · {Number(score?.score??lead.score??0)}</span><p className="mt-2 text-[10px] text-[#8F949D]">{lead.next_action_at?"Next "+dateTime(lead.next_action_at):"Updated "+date(lead.updated_at)}</p></div></div></Link>}):<p className="rounded-xl bg-emerald-500/[.06] p-4 text-sm text-emerald-100">No active lead opportunities right now.</p>}</div>
      </article>

      <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
        <p className="text-[10px] font-black uppercase tracking-[.16em] text-emerald-300">Customer revenue layer</p>
        <h2 className="mt-1 text-xl font-black text-white">From first order to repeat revenue</h2>
        <p className="mt-2 text-xs leading-5 text-[#9CA3AF]">Real customer/order metrics. These are not attributed to CRM leads unless a direct lead-to-customer relationship exists.</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            ["Customers with orders",customerSummary.completedCustomers],
            ["Exactly 1 valid order",customerSummary.firstOrderCustomers],
            ["Repeat customers",customerSummary.repeatCustomers],
            ["Active in last 30d",customerSummary.active30],
            ["Reactivation candidates",customerSummary.reactivation],
            ["30-day completed value",money(revenue30)],
          ].map(([name,value])=><div key={String(name)} className="rounded-xl border border-white/10 bg-[#0B0B0F] p-4"><p className="text-[9px] font-black uppercase tracking-wide text-[#8F949D]">{name}</p><b className="mt-2 block text-lg text-white">{value}</b></div>)}
        </div>
        <Link href="/admin/crm/reactivation" className="mt-4 inline-flex items-center gap-2 text-xs font-black text-orange-200">Open reactivation queue <ArrowRight size={14}/></Link>
      </article>
    </section>

    <section className="mt-6 rounded-2xl border border-orange-400/20 bg-[linear-gradient(135deg,rgba(249,115,22,.07),rgba(17,17,17,.98)_55%)] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Repeat-revenue queue</p><h2 className="mt-1 text-xl font-black text-white">Highest-value customers ready for review</h2><p className="mt-1 text-xs text-[#9CA3AF]">Customers with at least one valid order and 21+ days since the latest completed order.</p></div><Link href="/admin/crm/reactivation" className="text-xs font-black text-orange-200">Full queue →</Link></div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{reactivationCustomers.length?reactivationCustomers.map(row=><Link key={row.profile.id} href={"/admin/crm/customers/"+row.profile.id} className="rounded-xl border border-white/10 bg-[#0B0B0F] p-4"><UsersRound size={16} className="text-orange-300"/><b className="mt-3 block truncate text-sm text-white">{row.profile.full_name||row.profile.email}</b><p className="mt-1 text-xs text-[#9CA3AF]">{row.metrics.validOrders} orders · {row.metrics.topPlatform||"No platform"}</p><div className="mt-3 flex items-center justify-between text-xs"><span className="text-[#8F949D]">Lifetime value</span><b className="text-white">{money(row.metrics.totalSpend)}</b></div><div className="mt-1 flex items-center justify-between text-xs"><span className="text-[#8F949D]">Last completed</span><span className="text-[#D1D5DB]">{date(row.lastCompletedAt)}</span></div></Link>):<p className="col-span-full rounded-xl bg-emerald-500/[.06] p-4 text-sm text-emerald-100">No reactivation candidates currently meet the 21-day review rule.</p>}</div>
    </section>

    <section className="mt-6 grid gap-3 sm:grid-cols-3">
      <Link href="/admin/crm/outreach" className="rounded-2xl border border-white/10 bg-[#111111] p-5"><BadgeDollarSign className="text-orange-300"/><h3 className="mt-3 font-black text-white">Outreach execution</h3><p className="mt-2 text-xs leading-5 text-[#9CA3AF]">Review sequences, drafts and sending controls.</p><span className="mt-4 inline-flex text-xs font-black text-orange-200">Open outreach →</span></Link>
      <Link href="/admin/crm/replies" className="rounded-2xl border border-white/10 bg-[#111111] p-5"><Flame className="text-orange-300"/><h3 className="mt-3 font-black text-white">Reply handling</h3><p className="mt-2 text-xs leading-5 text-[#9CA3AF]">Prioritize interested, meeting and information-request replies.</p><span className="mt-4 inline-flex text-xs font-black text-orange-200">Open replies →</span></Link>
      <Link href="/admin/crm/follow-ups" className="rounded-2xl border border-white/10 bg-[#111111] p-5"><RefreshCcw className="text-orange-300"/><h3 className="mt-3 font-black text-white">Follow-up discipline</h3><p className="mt-2 text-xs leading-5 text-[#9CA3AF]">Keep sales and retention tasks from going stale.</p><span className="mt-4 inline-flex text-xs font-black text-orange-200">Open follow-ups →</span></Link>
    </section>
  </main>;
}
