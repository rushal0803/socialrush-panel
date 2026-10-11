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
 const [follow,reply,leads,candidates,messages,automation,discovery,brief,outreachSettings,customerQueued,customerSent,customerDelivered,customerFailed,customerAccepted,customerUnknown,webhookFailures,deliveryWebhooks]=await Promise.all([
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
  db.from("customer_email_events").select("id",{count:"exact",head:true}).eq("delivery_status","accepted"),
  db.from("customer_email_events").select("id",{count:"exact",head:true}).is("delivery_status",null),
  db.from("crm_resend_webhook_events").select("event_id",{count:"exact",head:true}).eq("status","failed"),
  db.from("crm_resend_webhook_events").select("event_id",{count:"exact",head:true}).eq("event_type","email.delivered"),
 ]);
 const errors=[follow,reply,leads,candidates,messages,automation,discovery,brief,outreachSettings,customerQueued,customerSent,customerDelivered,customerFailed,customerAccepted,customerUnknown,webhookFailures,deliveryWebhooks].map(x=>x.error?.message).filter(Boolean);
 const a=automation.data?.[0] as Run|undefined,d=discovery.data?.[0] as Run|undefined;
 const hoursSince=(iso?:string|null)=>iso?Math.max(0,(now.getTime()-Date.parse(iso))/3600000):null;
 const automationAge=hoursSince(a?.started_at),discoveryAge=hoursSince(d?.started_at);
 const briefAge=hoursSince(brief.data?.[0]?.generated_at);
 const emailTrackingNeedsAttention=(customerAccepted.count??0)>0&&(deliveryWebhooks.count??0)===0;
 const alerts=[
  errors.length>0?String(errors.length)+" CRM monitoring queries failed; status is incomplete and needs investigation":null,
  briefAge===null?"No CRM daily brief has been recorded":null,
  briefAge!==null&&briefAge>36?"The CRM daily brief is more than 36 hours old":null,
  follow.count&&follow.count>0?String(follow.count)+" overdue customer follow-ups need attention":null,
  reply.count&&reply.count>0?String(reply.count)+" pending reply follow-ups need attention":null,
  a?.status!=="completed"?"Customer automation did not report a completed latest run":null,
  automationAge!==null&&automationAge>36?"Customer automation has not run in more than 36 hours":null,
  d?.status!=="completed"?"Prospect discovery latest run is not completed":null,
  discoveryAge!==null&&discoveryAge>36?"Prospect discovery has not run in more than 36 hours":null,
  customerFailed.count&&customerFailed.count>0?String(customerFailed.count)+" customer email delivery failures in the past 7 days":null,
  webhookFailures.count&&webhookFailures.count>0?String(webhookFailures.count)+" failed Resend webhook events":null,
  emailTrackingNeedsAttention?"Delivery tracking requires attention: accepted emails exist, but no email.delivered webhook is recorded. Verify the Resend webhook endpoint, event subscriptions and signing secret. Do not infer that recipients failed to receive emails.":null,
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
   <Metric label="Accepted, not confirmed · all time" value={customerAccepted.count??"Unavailable"}/>
   <Metric label="Unknown delivery · all time" value={customerUnknown.count??"Unavailable"}/>
   <Metric label="Resend delivery webhooks · all time" value={deliveryWebhooks.count??"Unavailable"}/>
   <Metric label="Failed webhooks · all time" value={webhookFailures.count??"Unavailable"}/>
   <Metric label="Automatic sending" value={outreachSettings.data?.enabled&&outreachSettings.data?.auto_send?"On":"Off"}/>
   <Metric label="Daily email cap" value={outreachSettings.data?.global_daily_send_limit??"Unavailable"}/>
   <Metric label="Daily lead-enrollment cap" value={outreachSettings.data?.autopilot_daily_enroll_limit??"Unavailable"}/>
  </section>
  <section className="grid gap-4 md:grid-cols-2">
   <article className="rounded-2xl border border-white/10 bg-[#111] p-5"><h2 className="font-bold">Customer automation</h2><p className="mt-3 text-sm">Last run: {format(a?.started_at)}</p><p className="mt-1 text-sm">Status: {a?.status??"Unknown"}</p>{a?.error_message&&<p className="mt-2 text-sm text-red-300">{a.error_message}</p>}</article>
   <article className="rounded-2xl border border-white/10 bg-[#111] p-5"><h2 className="font-bold">Lead discovery</h2><p className="mt-3 text-sm">Last run: {format(d?.started_at)}</p><p className="mt-1 text-sm">Status: {d?.status??"Unknown"}</p>{d?.error_message&&<p className="mt-2 text-sm text-red-300">{d.error_message}</p>}</article>
  </section>
  <section className="rounded-2xl border border-white/10 bg-[#111] p-5"><h2 className="font-bold">Actions requiring attention</h2>{alerts.length?<ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-amber-200">{alerts.map(x=><li key={x}>{x}</li>)}</ul>:<p className="mt-3 text-sm text-zinc-300">No current alerts from the available monitored counters.</p>}
  <div className="mt-4 flex flex-wrap gap-3"><Link href="/admin/crm/follow-ups?view=overdue" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold">Review follow-ups</Link><Link href="/admin/crm/pipeline" className="rounded-lg border border-white/20 px-4 py-2 text-sm">Review sales pipeline</Link></div></section>
  <section className="rounded-2xl border border-orange-400/20 bg-[#111] p-5"><h2 className="font-bold">Delivery verification checklist</h2><ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-300"><li>In Resend, verify the webhook target matches the production /api/webhooks/resend endpoint.</li><li>Enable email.delivered, email.bounced, email.complained, email.suppressed and email.failed events.</li><li>Confirm the production webhook signing secret matches the active Resend endpoint; never paste it into tickets or logs.</li><li>Send one authorized test email, then verify its provider message ID matches a customer email event and that delivery status updates.</li><li>Investigate failures before adjusting outreach volume.</li></ol></section>
  <p className="text-xs text-zinc-500">Last daily brief: {format(brief.data?.[0]?.generated_at)}. Counts represent database states; sent emails are not necessarily delivered. {errors.length?"Some data sources failed: "+errors.join("; "):""}</p>
 </main>;
}
