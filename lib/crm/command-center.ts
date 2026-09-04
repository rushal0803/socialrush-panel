/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { createClient } from "@/lib/supabase/server";

const limit = 100;
const asArray = <T>(value: T[] | null) => value || [];
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString(); };

export async function getCommandCenterData() {
  const db = await createClient();
  const now = new Date().toISOString();
  const today = startOfToday();
  const [scores, leads, contacts, replies, leadFollowups, customerFollowups, customers, profiles, tags, webhooks, brief, health, outreach, replySettings] = await Promise.all([
    db.from("crm_lead_scores").select("lead_id,score,grade,score_reasons,calculated_at").order("score", { ascending: false }).limit(limit),
    db.from("crm_leads").select("id,business_name,status,priority,recommended_service,last_contacted_at,updated_at,created_at").order("updated_at", { ascending: false }).limit(limit),
    db.from("crm_lead_contacts").select("id,lead_id,full_name,email,verification_status,opted_out_at,compliance_status").limit(300),
    db.from("crm_inbound_messages").select("id,lead_id,classification,needs_admin_review,received_at,subject").order("received_at", { ascending: false }).limit(200),
    db.from("crm_lead_reply_followups").select("id,lead_id,title,due_at,priority,status").eq("status", "pending").order("due_at").limit(limit),
    db.from("crm_follow_ups").select("id,customer_id,title,due_at,follow_up_type,status").eq("status", "pending").order("due_at").limit(limit),
    db.from("crm_customer_profiles").select("customer_id,lifecycle_stage,priority,updated_at").in("lifecycle_stage", ["vip", "at_risk", "inactive"]).limit(limit),
    db.from("profiles").select("id,full_name,email").limit(300),
    db.from("crm_customer_tags").select("customer_id,tag").limit(300),
    db.from("crm_resend_webhook_events").select("event_id,event_type,status,attempt_count,last_error,created_at,updated_at,processed_at").order("updated_at", { ascending: false }).limit(30),
    db.from("crm_daily_briefs").select("brief_date,generated_at,summary").order("brief_date", { ascending: false }).limit(1).maybeSingle(),
    db.from("crm_automation_health_snapshots").select("status,summary,captured_at").order("captured_at", { ascending: false }).limit(1).maybeSingle(),
    db.from("crm_outreach_settings").select("auto_send").limit(1).maybeSingle(),
    db.from("crm_reply_automation_settings").select("reply_detection_enabled,auto_classify_replies,auto_stop_sequence_on_reply,create_reply_followups,generate_ai_reply_drafts").eq("id", true).maybeSingle(),
  ]);
  const scoreRows = asArray(scores.data), leadRows = asArray(leads.data), contactRows = asArray(contacts.data), replyRows = asArray(replies.data);
  const contactsByLead = new Map<string, any[]>(); contactRows.forEach((contact: any) => contactsByLead.set(contact.lead_id, [...(contactsByLead.get(contact.lead_id) || []), contact]));
  const repliesByLead = new Map<string, any[]>(); replyRows.forEach((reply: any) => reply.lead_id && repliesByLead.set(reply.lead_id, [...(repliesByLead.get(reply.lead_id) || []), reply]));
  const leadById = new Map(leadRows.map((lead: any) => [lead.id, lead]));
  const hotLeads = scoreRows.filter((score: any) => score.grade === "hot").slice(0, 10).map((score: any) => {
    const lead: any = leadById.get(score.lead_id); const latest = repliesByLead.get(score.lead_id)?.[0]; const contact = contactsByLead.get(score.lead_id)?.[0]; const followup = asArray(leadFollowups.data).find((item: any) => item.lead_id === score.lead_id);
    return { ...score, lead, latest, contact, followup };
  }).filter((item: any) => item.lead);
  const attention: any[] = [];
  asArray(leadFollowups.data).filter((item: any) => item.due_at < now).forEach((item: any) => attention.push({ severity: item.priority === "high" ? "critical" : "high", category: "Overdue follow-up", title: leadById.get(item.lead_id)?.business_name || "Lead", reason: item.title, age: item.due_at, href: `/admin/crm/leads/${item.lead_id}`, cta: "Open follow-up" }));
  replyRows.filter((reply: any) => reply.needs_admin_review || reply.classification === "other").slice(0, 10).forEach((reply: any) => attention.push({ severity: "high", category: "Reply needs review", title: leadById.get(reply.lead_id)?.business_name || "Inbound reply", reason: reply.subject || "Reply requires classification review", age: reply.received_at, href: "/admin/crm/replies", cta: "View reply" }));
  asArray(webhooks.data).filter((event: any) => event.status === "failed" || (event.status === "processing" && event.updated_at < new Date(Date.now() - 15 * 60_000).toISOString())).slice(0, 10).forEach((event: any) => attention.push({ severity: "critical", category: "Automation failure", title: event.event_type, reason: event.last_error ? "Webhook processing failed" : "Webhook processing is stuck", age: event.updated_at, href: "/admin/crm/automations", cta: "Review failure" }));
  hotLeads.filter((item: any) => item.latest?.classification === "interested" && !item.followup).forEach((item: any) => attention.push({ severity: "high", category: "Hot lead", title: item.lead.business_name, reason: "Interested reply without a pending follow-up", age: item.latest.received_at, href: `/admin/crm/leads/${item.lead.id}`, cta: "View lead" }));
  const severity = { critical: 0, high: 1, medium: 2, low: 3 } as Record<string, number>;
  attention.sort((a, b) => severity[a.severity] - severity[b.severity] || Date.parse(a.age) - Date.parse(b.age));
  const customerById = new Map(asArray(customers.data).map((row: any) => [row.customer_id, row])); const profileById = new Map(asArray(profiles.data).map((row: any) => [row.id, row]));
  const customerAttention = asArray(customerFollowups.data).filter((followup: any) => customerById.has(followup.customer_id) && followup.due_at <= now).slice(0, 8).map((followup: any) => ({ followup, customer: customerById.get(followup.customer_id), profile: profileById.get(followup.customer_id), tags: asArray(tags.data).filter((tag: any) => tag.customer_id === followup.customer_id).map((tag: any) => tag.tag) }));
  const funnel = ["new", "ready", "contacted", "replied", "qualified", "won", "lost"].map(status => [status, leadRows.filter((lead: any) => lead.status === status).length]);
  const replyCounts = ["interested", "meeting_request", "needs_information", "not_now", "negative_reply", "unsubscribe", "other"].map(name => [name, replyRows.filter((reply: any) => reply.received_at >= new Date(Date.now() - 7 * 864e5).toISOString() && (name === "other" ? reply.classification === "other" || reply.needs_admin_review : reply.classification === name)).length]);
  return { now, today, hotLeads, attention: attention.slice(0, 12), customerAttention, funnel, replyCounts, webhooks: asArray(webhooks.data), brief: brief.data, health: health.data, leadFollowups: asArray(leadFollowups.data), customerFollowups: asArray(customerFollowups.data), settings: { autoSend: Boolean(outreach.data?.auto_send), replies: replySettings.data }, errors: [scores, leads, contacts, replies, leadFollowups, customerFollowups, customers, webhooks].filter(result => result.error).length };
}
