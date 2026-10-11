import Link from "next/link";
import {createClient} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Run = {started_at:string;status:string;error_message?:string|null};
const format=(date:string|null|undefined)=>date?new Date(date).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",dateStyle:"medium",timeStyle:"short"}):"Never";
function Metric({label,value,detail}:{label:string;value:number|string;detail?:string}){return <div className="rounded-2xl border border-white/10 bg-[#111] p-5"><p className="text-xs text-zinc-400">{label}</p><p className="mt-2 text-3xl font-bold text-white">{value}</p>{detail&&<p className="mt-2 text-xs text-zinc-400">{detail}</p>}</div>}

export default async function AutomationHealthPage(){
 const db=await createClient();
 const now=new Date();
 const since=new Date(now.getTime()-7*864e5).toISOString();
 const [follow,reply,leads,candidates,messages,automation,discovery,brief,outreachSettings,customerQueued,customerSent,customerDelivered,customerFailed]=await Promise.all([
  db.from("crm_follow_ups").select("id",{count:"exact",head:true}).eq("status","pending").lt("due_at",now.toISOString()),
  db.from("crm_lead_reply_followups").select("id",{count:"exact",head:true}).eq("status","pending"),
  db.from("crm_leads").select("id",{count:"exact",head:true}),
  db.from("crm_lead_candidates").select("id",{count:"exact",head:true}).eq("qualification_status","qualified"),
  db.from("crm_outreach_messages").select("id",{count:"exact",head:true}).eq("status","sent").gte("sent_at",since),
  db.from("crm_automation_runs").select("started_at,status,error_message").order("started_at",{ascending:false}).limit(1),
  db.from("crm_prospect_discovery_runs").select("started_at,status,error_message").order("started_at",{ascending:false}).limit(1),
  db.from("crm_daily_briefs").select("generated_at").order("generated_at",{ascending:false}).limit(1),
  db.from("crm_outreach_settings").select("enabled,auto_send,global_daily_send_limit,autopilot_daily_enroll_limit").limit(1).maybeSingle(),
  db.from("customer_email_events").select("id",{count:"exact",head:true}).eq("status","queued"),
  db.from("customer_email_events").select("id",{count:"exact",head:true}).eq("status","sent").gte("sent_at",since),
  db.from("customer_email_events").select("id",{count:"exact",head:true}).eq("delivery_status","delivered").gte("sent_at",since),
  db.from("customer_email_events").select("id",{count:"exact",head:true}).in("delivery_status",["bounced","complained","suppressed","failed"]).gte("sent_at",since),
 ]);
 const errors=[follow,reply,leads,candidates,messages,automation,discovery,brief,outreachSettings,customerQueued,customerSent,customerDelivered,customerFailed].map(x=>x.error?.message).filter(Boolean);
 const a=automation.data?.[0] as Run|undefined,d=discovery.data?.[0] as Run|undefined;
 const alerts=[
  follow.count&&follow.count>0?String(follow.count)+" overdue customer follow-ups need attention":null,
  reply.count&&reply.count>0?String(reply.count)+" pending reply follow-ups need attention":null,
  a?.status!=="completed"?"Customer automation did not report a completed latest run":null,
  d?.status!=="completed"?"Prospect discovery latest run is not completed":null,
  customerFailed.count&&customerFailed.count>0?String(customerFailed.count)+" customer email delivery failures in the past 7 days":null,
 ].filter(Boolean);
 return <main className="mx-auto max-w-6xl space-y-7 p-4 text-white sm:p-8">
  <header><Link href="/admin/crm" className="text-sm text-orange-300">← CRM overview</Link><p className="mt-5 text-xs font-bold uppercase tracking-widest text-orange-300">Operations</p><h1 className="mt-2 text-3xl font-black">CRM Automation Health</h1><p className="mt-2 text-sm text-zinc-400">Live operational indicators. This page never sends email or changes CRM records.</p></header>
  <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
   <Metric label="Overdue customer follow-ups" value={follow.count??"Unavailable"}/>
   <Metric label="Open reply follow-ups" value={reply.count??"Unavailable"}/>
   <Metric label="Total sales leads" value={leads.count??"Unavailable"}/>
   <Metric label="Qualified candidates" value={candidates.count??"Unavailable"}/>
   <Metric label="Cold outreach sent · 7 days" value={messages.count??"Unavailable"}/>
   <Metric label="Customer emails queued" value={customerQueued.count??"Unavailable"}/>
   <Metric label="Customer emails sent · 7 days" value={customerSent.count??"Unavailable"}/>
   <Metric label="Customer emails delivered · 7 days" value={customerDelivered.count??"Unavailable"}/>
   <Metric label="Customer delivery failures · 7 days" value={customerFailed.count??"Unavailable"}/>
   <Metric label="Automatic sending" value={outreachSettings.data?.enabled&&outreachSettings.data?.auto_send?"On":"Off"}/>
   <Metric label="Daily email cap" value={outreachSettings.data?.global_daily_send_limit??"Unavailable"}/>
   <Metric label="Daily lead-enrollment cap" value={outreachSettings.data?.autopilot_daily_enroll_limit??"Unavailable"}/>
  </section>
  <section className="grid gap-4 md:grid-cols-2">
   <article className="rounded-2xl border border-white/10 bg-[#111] p-5"><h2 className="font-bold">Customer automation</h2><p className="mt-3 text-sm">Last run: {format(a?.started_at)}</p><p className="mt-1 text-sm">Status: {a?.status??"Unknown"}</p>{a?.error_message&&<p className="mt-2 text-sm text-red-300">{a.error_message}</p>}</article>
   <article className="rounded-2xl border border-white/10 bg-[#111] p-5"><h2 className="font-bold">Lead discovery</h2><p className="mt-3 text-sm">Last run: {format(d?.started_at)}</p><p className="mt-1 text-sm">Status: {d?.status??"Unknown"}</p>{d?.error_message&&<p className="mt-2 text-sm text-red-300">{d.error_message}</p>}</article>
  </section>
  <section className="rounded-2xl border border-white/10 bg-[#111] p-5"><h2 className="font-bold">Actions requiring attention</h2>{alerts.length?<ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-amber-200">{alerts.map(x=><li key={x}>{x}</li>)}</ul>:<p className="mt-3 text-sm text-zinc-300">No pending alerts from the monitored counters.</p>}
  <div className="mt-4 flex flex-wrap gap-3"><Link href="/admin/crm/follow-ups?view=overdue" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold">Review follow-ups</Link><Link href="/admin/crm/pipeline" className="rounded-lg border border-white/20 px-4 py-2 text-sm">Review sales pipeline</Link></div></section>
  <p className="text-xs text-zinc-500">Last daily brief: {format(brief.data?.[0]?.generated_at)}. Counts represent database states; sent emails are not necessarily delivered. {errors.length?"Some data sources failed: "+errors.join("; "):""}</p>
 </main>;
}
