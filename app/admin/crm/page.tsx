/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import {AlertTriangle,CheckCircle2,Gift,ShoppingCart,Users} from "lucide-react";
import {createClient} from "@/lib/supabase/server";
import {dateTime,metricsForOrders,money} from "@/lib/crm/types";

const title=(x:string)=>x.replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());

export default async function CrmOverviewPage(){
  const s=await createClient();
  const now=new Date().toISOString();
  const sinceDate=new Date(Date.now()-30*864e5);
  const since=sinceDate.toISOString();
  const draftSince=new Date(Date.now()-7*864e5).toISOString();
  const funnelSince=new Date(Date.now()-7*864e5).toISOString();

  const [pr,or,cr,fr,sr,rr,dr,rw,rules,ar]=await Promise.all([
    s.from("profiles").select("id,full_name,email,created_at").neq("role","admin").order("created_at",{ascending:false}).limit(1000),
    s.from("orders").select("user_id,charge,status,payment_status,platform,created_at").order("created_at",{ascending:false}).limit(10000),
    s.from("crm_customer_profiles").select("customer_id,lifecycle_stage,priority"),
    s.from("crm_follow_ups").select("id,customer_id,title,due_at,status,follow_up_type").eq("status","pending").order("due_at").limit(100),
    s.from("support_tickets").select("id,status").limit(1000),
    s.from("order_refill_requests").select("id,status").limit(1000),
    s.from("order_drafts").select("user_id,updated_at").limit(2000),
    s.from("customer_reward_events").select("user_id,amount,status,source,created_at").eq("source","first_order_bonus").limit(2000),
    s.from("reward_programme_rules").select("enabled,manual_approval,minimum_order_amount,new_customer_reward").eq("id",true).maybeSingle(),
    s.from("analytics_events").select("event_name,customer_id,device_category,safe_metadata,created_at").gte("created_at",funnelSince).in("event_name",["service_selected","payment_started","checkout_started","checkout_error"]).limit(5000),
  ]);

  const profiles=(pr.data||[])as any[];
  const orders=(or.data||[])as any[];
  const crmRows=(cr.data||[])as any[];
  const follow=(fr.data||[])as any[];
  const drafts=(dr.data||[])as any[];
  const rewards=(rw.data||[])as any[];
  const by=new Map<string,any[]>();
  orders.forEach(o=>by.set(o.user_id,[...(by.get(o.user_id)||[]),o]));
  const sum=profiles.map(p=>({p,m:metricsForOrders(by.get(p.id)||[])}));
  const revenue=sum.reduce((n,x)=>n+x.m.totalSpend,0);
  const valid=sum.reduce((n,x)=>n+x.m.validOrders,0);
  const life=crmRows.reduce((a,x)=>{a[x.lifecycle_stage]=(a[x.lifecycle_stage]||0)+1;return a},{} as Record<string,number>);
  const people=new Map(profiles.map(p=>[p.id,p]));
  const overdue=follow.filter(x=>x.due_at<now);
  const high=crmRows.filter(x=>x.priority==="high");
  const neverOrdered=sum.filter(x=>x.m.validOrders===0);
  const newCustomers=sum.filter(x=>x.p.created_at>=since);
  const newCustomersWithOrder=newCustomers.filter(x=>x.m.validOrders>0);
  const signupToFirstOrder=newCustomers.length?Math.round(newCustomersWithOrder.length/newCustomers.length*1000)/10:0;
  const recentDrafts=drafts.filter(x=>x.updated_at>=draftSince);
  const draftUsers=new Set(drafts.map(x=>x.user_id));
  const neverOrderedWithDraft=neverOrdered.filter(x=>draftUsers.has(x.p.id)).length;
  const creditedRewards=rewards.filter(x=>x.status==="credited");
  const rewardTotal=creditedRewards.reduce((n,x)=>n+Number(x.amount||0),0);
  const rewardRule=rules.data as any;
  const analytics=(ar.data||[]) as any[];
  const uniqueCustomers=(eventName:string)=>new Set(analytics.filter(x=>x.event_name===eventName&&x.customer_id).map(x=>x.customer_id)).size;
  const serviceSelected=uniqueCustomers("service_selected");
  const paymentStarted=uniqueCustomers("payment_started");
  const checkoutErrors=uniqueCustomers("checkout_error");
  const uniquePathCustomers=(eventName:string,path:string,device?:string)=>new Set(analytics.filter(x=>x.event_name===eventName&&x.customer_id&&x.safe_metadata?.payment_path===path&&(!device||x.device_category===device)).map(x=>x.customer_id)).size;
  const cashfreePayments=uniquePathCustomers("payment_started","cashfree");
  const manualPayments=uniquePathCustomers("payment_started","manual_direct");
  const cashfreeCheckouts=uniquePathCustomers("checkout_started","cashfree");
  const manualCheckouts=uniquePathCustomers("checkout_started","manual_direct");
  const walletCheckouts=uniquePathCustomers("checkout_started","wallet");
  const serviceToPayment=serviceSelected?Math.round(paymentStarted/serviceSelected*1000)/10:0;
  const cashfreeToCheckout=cashfreePayments?Math.round(cashfreeCheckouts/cashfreePayments*1000)/10:0;
  const manualToCheckout=manualPayments?Math.round(manualCheckouts/manualPayments*1000)/10:0;
  const mobileCashfreePayments=uniquePathCustomers("payment_started","cashfree","mobile");
  const mobileCashfreeCheckouts=uniquePathCustomers("checkout_started","cashfree","mobile");
  const mobileManualPayments=uniquePathCustomers("payment_started","manual_direct","mobile");
  const mobileManualCheckouts=uniquePathCustomers("checkout_started","manual_direct","mobile");
  const errorStageCounts=analytics.filter(x=>x.event_name==="checkout_error").reduce((acc:Record<string,number>,x:any)=>{const stage=String(x.safe_metadata?.step||"unknown");acc[stage]=(acc[stage]||0)+1;return acc;},{} as Record<string,number>);
  const errorStages=(Object.entries(errorStageCounts) as Array<[string,number]>).sort((a,b)=>b[1]-a[1]).slice(0,4);

  const cards=[
    ["Total Customers",profiles.length],
    ["New Customers",newCustomers.length],
    ["Active Customers",sum.filter(x=>x.m.lastOrderAt&&Date.parse(x.m.lastOrderAt)>Date.now()-90*864e5).length],
    ["Repeat Customers",sum.filter(x=>x.m.validOrders>=2).length],
    ["VIP Customers",life.vip||0],
    ["Total Revenue",money(revenue)],
    ["Average Order Value",money(valid?revenue/valid:0)],
    ["Follow-ups Due",follow.filter(x=>x.due_at<=new Date(Date.now()+864e5).toISOString()).length],
  ];

  const conversion=[
    ["Never Ordered",neverOrdered.length,"Accounts with no valid order"],
    ["Saved Drafts",drafts.length,"Unfinished orders currently saved"],
    ["Drafts · 7 Days",recentDrafts.length,"Recent high-intent unfinished orders"],
    ["Never Ordered + Draft",neverOrderedWithDraft,"Highest-intent first-order leads"],
    ["30-Day First Order Rate",`${signupToFirstOrder}%`,`${newCustomersWithOrder.length} of ${newCustomers.length} recent signups converted`],
    ["Bonus Credited",creditedRewards.length,`${money(rewardTotal)} credited in first-order rewards`],
  ];

  const issues=[
    overdue.length&&`${overdue.length} overdue follow-up${overdue.length>1?"s":""}`,
    high.length&&`${high.length} high-priority customer${high.length>1?"s":""}`,
    (sr.data||[]).filter((x:any)=>!["closed","resolved"].includes(String(x.status).toLowerCase())).length&&`${(sr.data||[]).filter((x:any)=>!["closed","resolved"].includes(String(x.status).toLowerCase())).length} open support issue${(sr.data||[]).length>1?"s":""}`,
    (rr.data||[]).filter((x:any)=>!["completed","rejected","cancelled"].includes(String(x.status).toLowerCase())).length&&`${(rr.data||[]).filter((x:any)=>!["completed","rejected","cancelled"].includes(String(x.status).toLowerCase())).length} pending refill${(rr.data||[]).length>1?"s":""}`,
  ].filter(Boolean);

  return <main className="mx-auto max-w-[1650px] p-4 sm:p-8">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">Customer intelligence</p>
        <h1 className="mt-2 text-3xl font-black text-white">SocialRUSH CRM</h1>
        <p className="mt-2 text-sm text-[#9CA3AF]">Understand customer value, first-order conversion and next steps.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/crm/reactivation" className="rounded-xl border border-orange-400/30 px-4 py-3 text-xs font-bold text-orange-200">Reactivation Queue</Link>
        <Link href="/admin/crm/customers?filter=never_ordered" className="rounded-xl border border-emerald-400/30 px-4 py-3 text-xs font-bold text-emerald-200">Never Ordered</Link>
        <Link href="/admin/crm/customers?filter=abandoned_draft" className="rounded-xl border border-amber-400/30 px-4 py-3 text-xs font-bold text-amber-200">Abandoned Drafts</Link>
        <Link href="/admin/crm/customers" className="rounded-xl border border-orange-400/30 px-4 py-3 text-xs font-bold text-orange-200">Customers</Link>
        <Link href="/admin/crm/follow-ups" className="rounded-xl bg-orange-500 px-4 py-3 text-xs font-bold text-white">Follow-ups</Link>
      </div>
    </div>

    <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(([a,b])=><article key={String(a)} className="rounded-2xl border border-white/10 bg-[#111111] p-5 transition hover:-translate-y-0.5 hover:border-orange-400/30"><p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">{a}</p><b className="mt-3 block text-2xl text-white">{b}</b></article>)}
    </section>

    <section className="mt-6 rounded-2xl border border-emerald-400/20 bg-[linear-gradient(135deg,rgba(16,185,129,.08),rgba(17,17,17,.98)_55%)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-emerald-300">First-order conversion</p>
          <h2 className="mt-1 text-xl font-black text-white">Turn registrations into paying customers</h2>
          <p className="mt-1 text-xs text-[#9CA3AF]">Live CRM signals for never-ordered users, abandoned drafts and first-order rewards.</p>
        </div>
        {rewardRule?.enabled&&!rewardRule?.manual_approval?<div className="rounded-xl border border-emerald-400/20 bg-emerald-500/[.07] px-3 py-2 text-xs text-emerald-100"><Gift className="mr-1.5 inline h-4 w-4"/>Offer live: <b>{money(Number(rewardRule.new_customer_reward||0))}</b> after first order ≥ <b>{money(Number(rewardRule.minimum_order_amount||0))}</b></div>:null}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {conversion.map(([label,value,helper])=><article key={String(label)} className="rounded-xl border border-white/10 bg-[#0B0B0F] p-4"><div className="flex items-center justify-between gap-2"><p className="text-[10px] font-black uppercase tracking-wider text-[#8F949D]">{label}</p>{String(label).includes("Draft")?<ShoppingCart className="h-4 w-4 text-orange-300"/>:<Users className="h-4 w-4 text-emerald-300"/>}</div><b className="mt-2 block text-2xl text-white">{value}</b><p className="mt-1 text-[11px] leading-5 text-[#8F949D]">{helper}</p></article>)}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/admin/crm/customers?filter=never_ordered" className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-black text-[#04110b]">Open Never-Ordered Users</Link>
        <Link href="/admin/crm/customers?filter=abandoned_draft" className="rounded-xl border border-amber-400/30 bg-amber-500/[.07] px-4 py-2.5 text-xs font-bold text-amber-100">Open Abandoned Drafts</Link>
        <Link href="/admin/crm/reactivation" className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-white">Open Reactivation Queue</Link>
      </div>
    </section>

    <section className="mt-6 rounded-2xl border border-sky-400/20 bg-[linear-gradient(135deg,rgba(14,165,233,.07),rgba(17,17,17,.98)_55%)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-sky-300">Checkout funnel · 7 days</p><h2 className="mt-1 text-xl font-black text-white">See exactly where buyers stop</h2><p className="mt-1 text-xs text-[#9CA3AF]">Unique signed-in customers. Payment-path and error-stage tracking was upgraded on 25 Sep, so use the newer data for clean comparisons.</p></div>
        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs leading-5 text-[#D1D5DB]">Mobile Cashfree: <b className="text-white">{mobileCashfreePayments}</b> → <b className="text-white">{mobileCashfreeCheckouts}</b><br/>Mobile direct pay: <b className="text-white">{mobileManualPayments}</b> → <b className="text-white">{mobileManualCheckouts}</b></div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Service selected",serviceSelected,"High-intent users"],
          ["Payment started",paymentStarted,String(serviceToPayment)+"% of selectors"],
          ["Cashfree checkout",cashfreeCheckouts,cashfreePayments?String(cashfreeToCheckout)+"% of Cashfree starts":"No Cashfree starts yet"],
          ["Direct-pay checkout",manualCheckouts,manualPayments?String(manualToCheckout)+"% of direct-pay starts":"No direct-pay starts yet"],
          ["Wallet checkout",walletCheckouts,"Wallet-funded checkout intents"],
          ["Checkout errors",checkoutErrors,checkoutErrors?"Inspect failure stages below":"No tracked errors in this window"],
        ].map(([label,value,helper])=><article key={String(label)} className="rounded-xl border border-white/10 bg-[#0B0B0F] p-4"><p className="text-[10px] font-black uppercase tracking-wider text-[#8F949D]">{label}</p><b className="mt-2 block text-2xl text-white">{value}</b><p className="mt-1 text-[11px] leading-5 text-[#8F949D]">{helper}</p></article>)}
      </div>
      {errorStages.length?<div className="mt-4 rounded-xl border border-red-400/15 bg-red-500/[.04] p-4"><p className="text-xs font-black text-red-100">Recent checkout error stages</p><div className="mt-2 flex flex-wrap gap-2">{errorStages.map(([stage,count])=><span key={stage} className="rounded-full border border-red-400/15 bg-red-500/[.06] px-2.5 py-1 text-[10px] font-bold text-red-200">{stage}: {count}</span>)}</div></div>:null}
    </section>

    <section className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <Panel title="Needs attention">{issues.length?<div className="space-y-2">{issues.map(x=><Link key={String(x)} href="/admin/crm/follow-ups?view=overdue" className="flex items-center gap-3 rounded-xl border border-red-400/15 bg-red-500/[.04] p-3 text-sm text-red-100"><AlertTriangle size={16}/>{x}</Link>)}</div>:<div className="flex items-center gap-3 rounded-xl bg-emerald-500/[.06] p-4 text-sm text-emerald-100"><CheckCircle2 size={18}/>Everything is caught up.</div>}</Panel>
      <Panel title="Customer lifecycle"><div className="space-y-3">{["new_customer","active","vip","at_risk","inactive"].map(x=>{const n=life[x]||0,p=profiles.length?Math.round(n/profiles.length*100):0;return <div key={x}><div className="flex justify-between text-xs"><span className="text-[#D1D5DB]">{title(x)}</span><b className="text-white">{n}</b></div><div className="mt-1 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-orange-400" style={{width:`${p}%`}}/></div></div>})}</div></Panel>
      <Panel title="Top customers">{sum.sort((a,b)=>b.m.totalSpend-a.m.totalSpend).slice(0,6).map(x=><Link key={x.p.id} href={`/admin/crm/customers/${x.p.id}`} className="flex justify-between border-b border-white/5 py-3 last:border-0"><span><b className="block text-sm text-white">{x.p.full_name||x.p.email}</b><small className="text-[#9CA3AF]">{x.m.validOrders} orders · {x.m.topPlatform||"No orders"}</small></span><b className="text-sm text-orange-200">{money(x.m.totalSpend)}</b></Link>)}</Panel>
      <Panel title="Upcoming follow-ups">{follow.slice(0,6).map(x=><Link key={x.id} href={`/admin/crm/customers/${x.customer_id}`} className="block border-b border-white/5 py-3 last:border-0"><b className="block text-sm text-white">{x.title}</b><small className="text-[#9CA3AF]">{people.get(x.customer_id)?.full_name||"Customer"} · {dateTime(x.due_at)}</small></Link>)}{!follow.length&&<p className="rounded-xl bg-emerald-500/[.06] p-4 text-sm text-emerald-100">No upcoming follow-ups.</p>}</Panel>
    </section>

    <section className="mt-6"><Panel title="Recent customer activity"><div className="grid gap-3 md:grid-cols-3">{profiles.slice(0,6).map(p=><Link key={p.id} href={`/admin/crm/customers/${p.id}`} className="rounded-xl bg-[#0B0B0F] p-4"><Users size={16} className="text-orange-300"/><b className="mt-3 block text-sm text-white">{p.full_name||p.email}</b><small className="text-[#9CA3AF]">New account · {dateTime(p.created_at)}</small></Link>)}</div></Panel></section>
  </main>
}

function Panel({title,children}:{title:string;children:React.ReactNode}){return <section className="rounded-2xl border border-white/10 bg-[#111111] p-5"><h2 className="mb-4 font-black text-white">{title}</h2>{children}</section>}
