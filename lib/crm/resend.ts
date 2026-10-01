import "server-only";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { ingestInboundReply } from "./reply-ingestion";
import { getLeadContactOutreachBlockReason, isLeadContactOutreachEligible } from "./outreach";
import { formatAutonomousOutreachEmail, formatOutreachEmail, renderOutreachSubject, renderOutreachText } from "./email-formatting";
import type { CRMLead, CRMLeadContact, CRMOutreachSettings, CRMSuppressionEntry } from "./types";

const OUTREACH_FROM = "SocialRUSH <growth@outreach.getsocialrush.com>";
const OUTREACH_REPLY_TO = "growth@outreach.getsocialrush.com";
const cleanEmail = (value: string) => value.trim().toLowerCase();
const textFromHtml = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
const client = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Resend is not configured.");
  return new Resend(key);
};

export function resendConfigured() { return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_WEBHOOK_SECRET); }
export function resendWebhookVerificationConfigured() { return Boolean(process.env.RESEND_WEBHOOK_SECRET); }

export function verifyResendWebhook(payload: string, headers: Headers) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) throw new Error("Resend webhook is not configured.");
  return client().webhooks.verify({ payload, webhookSecret: secret, headers: {
    id: headers.get("svix-id") || "", timestamp: headers.get("svix-timestamp") || "", signature: headers.get("svix-signature") || "",
  } });
}

type ResendEvent = { type?: string; data?: Record<string, unknown> };
const strings = (value: unknown) => Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : typeof value === "string" ? [value] : [];
const emailAddress = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  const direct = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(trimmed) ? trimmed : null;
  const bracketed = trimmed.match(/^[^<>]*<\s*([^\s@<>]+@[^\s@<>]+\.[^\s@<>]+)\s*>\s*$/)?.[1] || null;
  return cleanEmail(direct || bracketed || "") || null;
};
const safeError = (error: unknown) => error instanceof Error ? error.message.slice(0, 500) : "Unknown processing error.";
const webhookLog = (stage: string, details: Record<string, unknown>) => console.info("[crm][resend-webhook]", { stage, ...details });

type EventClaim = "claimed" | "duplicate" | "in_progress";
async function beginEvent(eventId: string, eventType: string): Promise<EventClaim> {
  const db = createAdminClient();
  const { data, error } = await db.rpc("claim_crm_resend_webhook_event", { p_event_id: eventId, p_event_type: eventType });
  if (error) throw error;
  if (data === "claimed" || data === "duplicate" || data === "in_progress") return data;
  throw new Error("Could not claim Resend webhook event.");
}

async function finishEvent(eventId: string) {
  const { error } = await createAdminClient().from("crm_resend_webhook_events").update({ status: "processed", processed_at: new Date().toISOString(), last_error: null, updated_at: new Date().toISOString() }).eq("event_id", eventId).eq("status", "processing");
  if (error) throw error;
}

async function failEvent(eventId: string, error: unknown) {
  const message = safeError(error);
  const { error: updateError } = await createAdminClient().from("crm_resend_webhook_events").update({ status: "failed", last_error: message, updated_at: new Date().toISOString() }).eq("event_id", eventId).eq("status", "processing");
  if (updateError) console.error("[crm][resend-webhook] unable to record failure", { eventId, error: safeError(updateError) });
  return message;
}

async function storeUnmatchedReceived(message: { id?: string; message_id?: string; from?: string; to?: unknown; subject?: string; text?: string; html?: string; created_at?: string }, reason: string) {
  const messageId = message.message_id || message.id;
  if (!messageId) throw new Error("Resend received email has no message ID.");
  const bodyText = (message.text || textFromHtml(message.html || "")).trim();
  const recipient = strings(message.to).map(emailAddress).find(Boolean) || null;
  const { error } = await createAdminClient().from("crm_unmatched_inbound_events").upsert({ provider: "resend", provider_message_id: messageId, from_email: String(message.from || "[unparseable]").slice(0, 320), to_email: recipient, subject: message.subject || null, body_text: (bodyText || "[No usable text body]").slice(0, 20000), received_at: message.created_at || new Date().toISOString(), reason }, { onConflict: "provider,provider_message_id" });
  if (error) throw error;
  return { unmatched: true, reason };
}

const supportedResendEvents = new Set(["email.received","email.bounced","email.delivered","email.complained","email.suppressed","email.failed"]);
export async function handleResendWebhook(event: ResendEvent, eventId: string) {
  const eventType = String(event.type || "");
  if (!eventId || !supportedResendEvents.has(eventType)) return { ignored: true };
  const claim = await beginEvent(eventId, eventType);
  webhookLog("claim", { eventType, eventId, status: claim });
  if (claim === "duplicate") return { duplicate: true };
  if (claim === "in_progress") return { inProgress: true };
  try {
    const data = event.data || {};
    const result =
      eventType === "email.received" ? await receive(data) :
      eventType === "email.bounced" ? await bounce(data) :
      eventType === "email.delivered" ? await delivered(data) :
      eventType === "email.complained" ? await complained(data) :
      eventType === "email.suppressed" ? await suppressed(data) :
      await deliveryFailed(data);
    await finishEvent(eventId);
    webhookLog("processed", { eventType, eventId, matched: !("unmatched" in result && result.unmatched) });
    return result;
  } catch (error) {
    const message = await failEvent(eventId, error);
    webhookLog("failed", { eventType, eventId, failureStage: "application", error: message });
    throw error;
  }
}

async function receive(data: Record<string, unknown>) {
  const emailId = String(data.email_id || data.id || "");
  if (!emailId) throw new Error("Resend received event has no email ID.");
  const received = await client().emails.receiving.get(emailId);
  if (received.error || !received.data) throw new Error("Could not retrieve the received Resend email.");
  const message = received.data;
  const headers = message.headers || {};
  const threadId = headers["in-reply-to"] || headers["references"] || message.message_id || null;
  const sender = emailAddress(message.from);
  if (!sender) return storeUnmatchedReceived(message, "unparseable_sender_address");
  const recipient = strings(message.to).map(emailAddress).find(Boolean) || null;
  const bodyText = (message.text || textFromHtml(message.html || "")).trim();
  if (!bodyText) throw new Error("Received Resend email has no usable text body.");
  return ingestInboundReply({ provider: "resend", messageId: message.message_id || message.id, threadId, fromEmail: sender, toEmail: recipient, subject: message.subject, bodyText, receivedAt: message.created_at });
}

async function bounce(data: Record<string, unknown>) {
  const providerMessageId = String(data.email_id || data.id || "");
  const recipient = emailAddress(strings(data.to)[0] || String(data.to || ""));
  if (!providerMessageId || !recipient || strings(data.to).length > 1) return { unmatched: true };
  const db = createAdminClient();
  const { data:message } = await db.from("crm_outreach_messages").select("id,contact_id,lead_id").eq("provider", "resend").eq("provider_message_id", providerMessageId).maybeSingle();
  if (!message?.contact_id) return { unmatched: true };
  const { data:contact } = await db.from("crm_lead_contacts").select("id,email,lead_id").eq("id", message.contact_id).maybeSingle();
  if (!contact || cleanEmail(contact.email) !== cleanEmail(recipient)) return { unmatched: true };
  const now = new Date().toISOString();
  await Promise.all([
    db.from("crm_outreach_messages").update({ status: "bounced", error_message: "Resend bounce", updated_at: now }).eq("id", message.id),
    db.from("crm_lead_contacts").update({ verification_status: "invalid", updated_at: now }).eq("id", contact.id),
    db.from("crm_lead_enrollments").update({ status: "bounced", next_send_at: null, updated_at: now }).eq("contact_id", contact.id).in("status", ["active", "paused"]),
    db.from("crm_suppression_list").upsert({ email: cleanEmail(contact.email), reason: "bounce", source: "resend" }, { onConflict: "email" }),
    db.from("crm_reply_audit_log").insert({ lead_id: contact.lead_id, action: "bounce_processed", details: { provider: "resend", provider_message_id: providerMessageId } }),
  ]);
  return { bounced: true };
}

type OutboundEventContext = { db: ReturnType<typeof createAdminClient>; message: { id:string; contact_id:string|null; lead_id:string; enrollment_id:string|null }; contact: { id:string; email:string; lead_id:string } };
async function outboundEventContext(data: Record<string, unknown>): Promise<OutboundEventContext | null> {
  const providerMessageId = String(data.email_id || data.id || "");
  const recipients = strings(data.to);
  if (!providerMessageId || recipients.length > 1) return null;
  const recipient = recipients.length ? emailAddress(recipients[0]) : null;
  const db = createAdminClient();
  const { data:message } = await db.from("crm_outreach_messages").select("id,contact_id,lead_id,enrollment_id").eq("provider","resend").eq("provider_message_id",providerMessageId).maybeSingle();
  if (!message?.contact_id) return null;
  const { data:contact } = await db.from("crm_lead_contacts").select("id,email,lead_id").eq("id",message.contact_id).maybeSingle();
  if (!contact || (recipient && cleanEmail(contact.email) !== cleanEmail(recipient))) return null;
  return { db, message, contact };
}

async function delivered(data: Record<string, unknown>) {
  const context = await outboundEventContext(data);
  if (!context) return { unmatched: true };
  const now = new Date().toISOString();
  const { error } = await context.db.from("crm_outreach_messages").update({ status:"delivered", delivered_at:now, error_message:null, updated_at:now }).eq("id",context.message.id).in("status",["sent","sending","delivered"]);
  if (error) throw error;
  return { delivered: true };
}

async function complained(data: Record<string, unknown>) {
  const context = await outboundEventContext(data);
  if (!context) return { unmatched: true };
  const now = new Date().toISOString();
  await Promise.all([
    context.db.from("crm_outreach_messages").update({ status:"failed", error_message:"Resend complaint", updated_at:now }).eq("id",context.message.id),
    context.db.from("crm_lead_contacts").update({ compliance_status:"blocked", opted_out_at:now, updated_at:now }).eq("id",context.contact.id),
    context.db.from("crm_lead_enrollments").update({ status:"opted_out", next_send_at:null, updated_at:now }).eq("contact_id",context.contact.id).in("status",["active","paused"]),
    context.db.from("crm_leads").update({ status:"do_not_contact", updated_at:now }).eq("id",context.contact.lead_id),
    context.db.from("crm_suppression_list").upsert({ email:cleanEmail(context.contact.email), reason:"complaint", source:"resend" },{ onConflict:"email" }),
    context.db.from("crm_reply_audit_log").insert({ lead_id:context.contact.lead_id, action:"complaint_processed", details:{ provider:"resend", message_id:context.message.id } }),
  ]);
  return { complained: true };
}

async function suppressed(data: Record<string, unknown>) {
  const context = await outboundEventContext(data);
  if (!context) return { unmatched: true };
  const now = new Date().toISOString();
  await Promise.all([
    context.db.from("crm_outreach_messages").update({ status:"failed", error_message:"Resend suppression", updated_at:now }).eq("id",context.message.id),
    context.db.from("crm_lead_contacts").update({ verification_status:"invalid", updated_at:now }).eq("id",context.contact.id),
    context.db.from("crm_lead_enrollments").update({ status:"failed", next_send_at:null, updated_at:now }).eq("contact_id",context.contact.id).in("status",["active","paused"]),
    context.db.from("crm_suppression_list").upsert({ email:cleanEmail(context.contact.email), reason:"invalid", source:"resend" },{ onConflict:"email" }),
    context.db.from("crm_reply_audit_log").insert({ lead_id:context.contact.lead_id, action:"provider_suppression_processed", details:{ provider:"resend", message_id:context.message.id } }),
  ]);
  return { suppressed: true };
}

async function deliveryFailed(data: Record<string, unknown>) {
  const context = await outboundEventContext(data);
  if (!context) return { unmatched: true };
  const now = new Date().toISOString();
  await Promise.all([
    context.db.from("crm_outreach_messages").update({ status:"failed", error_message:"Resend delivery failed", processing_started_at:null, updated_at:now }).eq("id",context.message.id),
    context.message.enrollment_id ? context.db.from("crm_lead_enrollments").update({ status:"failed", next_send_at:null, updated_at:now }).eq("id",context.message.enrollment_id) : Promise.resolve({ error:null }),
  ]);
  return { failed: true };
}

export async function sendApprovedResendDraft(messageId: string) {
  const db = createAdminClient();
  const { data:message, error } = await db.from("crm_outreach_messages").select("*").eq("id", messageId).eq("direction", "outbound").eq("status", "draft").maybeSingle();
  if (error || !message) throw new Error("Approved outreach draft not found.");
  const [{ data:contact }, { data:lead }, { data:settings }, { data:suppressions }] = await Promise.all([
    db.from("crm_lead_contacts").select("*").eq("id", message.contact_id).maybeSingle(), db.from("crm_leads").select("*").eq("id", message.lead_id).maybeSingle(),
    db.from("crm_outreach_settings").select("*").limit(1).maybeSingle(), db.from("crm_suppression_list").select("email"),
  ]);
  if (!contact || !lead || !settings || settings.provider !== "resend" || !settings.enabled || !isLeadContactOutreachEligible(contact as CRMLeadContact, lead as Pick<CRMLead, "status">, settings as CRMOutreachSettings, (suppressions || []) as CRMSuppressionEntry[])) throw new Error("This draft is not eligible for Resend delivery.");
  const personalization = { full_name: contact.full_name, business_name: lead.business_name, recommended_service: lead.recommended_service };
  const formatted = formatAutonomousOutreachEmail(message.body, personalization);
  const response = await client().emails.send({ from: OUTREACH_FROM, replyTo: OUTREACH_REPLY_TO, to: [contact.email], subject: renderOutreachSubject(message.subject, personalization), text: formatted.text, html: formatted.html }, { idempotencyKey: `crm-outreach-${message.id}` });
  if (response.error || !response.data?.id) throw new Error(response.error?.message || "Resend could not accept the draft.");
  const now = new Date().toISOString();
  await db.from("crm_outreach_messages").update({ provider: "resend", provider_message_id: response.data.id, status: "sent", sent_at: now, updated_at: now }).eq("id", message.id).is("provider_message_id", null);
  await db.from("crm_lead_activities").insert({ lead_id: message.lead_id, activity_type: "outreach_sent", details: { provider: "resend", message_id: response.data.id } });
  return { id: response.data.id };
}


type AutopilotMessage = {
  id:string; enrollment_id:string|null; lead_id:string; contact_id:string|null; sequence_id:string|null; step_number:number|null;
  subject:string|null; body:string|null; status:string; provider:string|null; provider_message_id:string|null;
  attempt_count:number; automation_source:string; created_at:string;
};
type AutopilotOutcome = { id:string; outcome:"sent"|"skipped"|"failed"; detail?:string };
const autopilotLeadStatuses = new Set(["new","researching","ready","contacted"]);

async function pauseAutopilotForHealth(db: ReturnType<typeof createAdminClient>, settings: CRMOutreachSettings) {
  const since = new Date(Date.now()-7*86400000).toISOString();
  const [{ count:complaints, error:complaintError }, { data:recent, error:recentError }] = await Promise.all([
    db.from("crm_suppression_list").select("id",{count:"exact",head:true}).eq("reason","complaint").eq("source","resend").gte("created_at",since),
    db.from("crm_outreach_messages").select("status,sent_at").eq("automation_source","autopilot").gte("sent_at",since),
  ]);
  if (complaintError || recentError) throw complaintError || recentError;
  if (settings.autopilot_pause_on_complaint && Number(complaints||0)>0) {
    await db.from("crm_outreach_settings").update({ auto_send:false, updated_at:new Date().toISOString() }).eq("id",1);
    return "complaint_detected";
  }
  const accepted=(recent||[]).length;
  const bounced=(recent||[]).filter(row=>row.status==="bounced").length;
  const threshold=Number(settings.autopilot_bounce_rate_threshold||0.1);
  if (accepted>=10 && accepted>0 && bounced/accepted>=threshold) {
    await db.from("crm_outreach_settings").update({ auto_send:false, updated_at:new Date().toISOString() }).eq("id",1);
    return "bounce_rate_threshold";
  }
  return null;
}

async function skipAutopilotMessage(db: ReturnType<typeof createAdminClient>, message: AutopilotMessage, detail:string, enrollmentStatus:"paused"|"replied"|"opted_out"|"bounced"|"failed"="paused") {
  const now=new Date().toISOString();
  const tasks: PromiseLike<unknown>[]=[
    db.from("crm_outreach_messages").update({ status:"skipped", error_message:detail, processing_started_at:null, updated_at:now }).eq("id",message.id)
  ];
  if(message.enrollment_id) tasks.push(db.from("crm_lead_enrollments").update({ status:enrollmentStatus, next_send_at:null, updated_at:now }).eq("id",message.enrollment_id));
  await Promise.all(tasks);
}

export async function processCrmOutreachAutopilot() {
  const db=createAdminClient();
  const { data:settings, error:settingsError }=await db.from("crm_outreach_settings").select("*").eq("id",1).single();
  if(settingsError||!settings)throw new Error("CRM outreach settings are unavailable.");
  const typedSettings=settings as CRMOutreachSettings;
  if(!typedSettings.enabled||!typedSettings.auto_send)return {status:"paused",processed:0,enrolled:0,queued:0,outcomes:[] as AutopilotOutcome[]};
  if(typedSettings.provider!=="resend"||!resendConfigured())throw new Error("CRM Autopilot requires Resend sending and webhook configuration.");

  const healthPause=await pauseAutopilotForHealth(db,typedSettings);
  if(healthPause)return {status:"auto_paused",reason:healthPause,processed:0,enrolled:0,queued:0,outcomes:[] as AutopilotOutcome[]};

  const [{data:enrolled,error:enrollError},{data:queued,error:queueError}]=await Promise.all([
    db.rpc("refresh_crm_outreach_autopilot"),
    db.rpc("enqueue_due_crm_outreach_messages"),
  ]);
  if(enrollError)throw enrollError;
  if(queueError)throw queueError;

  const outcomes:AutopilotOutcome[]=[];
  const maxPerRun=Math.max(1,Math.min(10,Number(typedSettings.autopilot_max_sends_per_run||3)));
  for(let index=0;index<maxPerRun;index+=1){
    const {data,error}=await db.rpc("claim_next_crm_outreach_message");
    if(error)throw error;
    const message=(data?.[0]||null) as AutopilotMessage|null;
    if(!message)break;

    try{
      if(message.automation_source!=="autopilot"||message.provider!=="resend"||!message.enrollment_id||!message.contact_id||!message.sequence_id||!message.step_number){
        await skipAutopilotMessage(db,message,"Skipped: invalid Autopilot queue record","failed");
        outcomes.push({id:message.id,outcome:"skipped",detail:"invalid_queue_record"});
        continue;
      }

      const [
        {data:contact,error:contactError},{data:lead,error:leadError},{data:enrollment,error:enrollmentError},
        {data:sequence,error:sequenceError},{data:score,error:scoreError},
        {data:reply,error:replyError},{data:steps,error:stepsError}
      ]=await Promise.all([
        db.from("crm_lead_contacts").select("*").eq("id",message.contact_id).single(),
        db.from("crm_leads").select("*").eq("id",message.lead_id).single(),
        db.from("crm_lead_enrollments").select("*").eq("id",message.enrollment_id).single(),
        db.from("crm_outreach_sequences").select("*").eq("id",message.sequence_id).single(),
        db.from("crm_lead_scores").select("score,grade").eq("lead_id",message.lead_id).maybeSingle(),
        db.from("crm_inbound_messages").select("id").eq("contact_id",message.contact_id).gte("received_at",message.created_at).limit(1).maybeSingle(),
        db.from("crm_outreach_sequence_steps").select("step_number,delay_days").eq("sequence_id",message.sequence_id).order("step_number"),
      ]);
      if(contactError||leadError||enrollmentError||sequenceError||scoreError||replyError||stepsError||!contact||!lead||!enrollment||!sequence)throw new Error("Autopilot eligibility recheck failed.");

      const {data:currentSettings,error:currentSettingsError}=await db.from("crm_outreach_settings").select("*").eq("id",1).single();
      if(currentSettingsError||!currentSettings)throw new Error("Autopilot settings recheck failed.");
      if(!currentSettings.enabled||!currentSettings.auto_send||currentSettings.provider!=="resend"){
        await skipAutopilotMessage(db,message,"Skipped: Autopilot was paused before send");
        outcomes.push({id:message.id,outcome:"skipped",detail:"autopilot_paused"});
        continue;
      }

      const {data:suppressed}=await db.from("crm_suppression_list").select("email").eq("email",cleanEmail(contact.email)).maybeSingle();
      const suppressionRows=suppressed?[suppressed as CRMSuppressionEntry]:[];
      const blockReason=getLeadContactOutreachBlockReason(contact as CRMLeadContact,lead as Pick<CRMLead,"status">,currentSettings as CRMOutreachSettings,suppressionRows);
      if(blockReason){
        const status=contact.opted_out_at||lead.status==="do_not_contact"?"opted_out":contact.verification_status==="invalid"?"bounced":"paused";
        await skipAutopilotMessage(db,message,`Skipped: ${blockReason}`,status);
        outcomes.push({id:message.id,outcome:"skipped",detail:blockReason});
        continue;
      }
      const grade=String(score?.grade||"");
      if(!score||Number(score.score)<Number(currentSettings.autopilot_min_score||60)||!["warm","hot"].includes(grade)){
        await skipAutopilotMessage(db,message,"Skipped: lead score fell below Autopilot threshold");
        outcomes.push({id:message.id,outcome:"skipped",detail:"score_below_threshold"});
        continue;
      }
      if(!autopilotLeadStatuses.has(String(lead.status))){
        await skipAutopilotMessage(db,message,"Skipped: lead status no longer allows cold follow-up",["replied","qualified"].includes(String(lead.status))?"replied":"paused");
        outcomes.push({id:message.id,outcome:"skipped",detail:"lead_status_changed"});
        continue;
      }
      if(reply){
        await skipAutopilotMessage(db,message,"Skipped: prospect replied before send","replied");
        outcomes.push({id:message.id,outcome:"skipped",detail:"reply_detected"});
        continue;
      }
      if(sequence.status!=="active"||enrollment.status!=="active"){
        await skipAutopilotMessage(db,message,"Skipped: sequence or enrollment is no longer active");
        outcomes.push({id:message.id,outcome:"skipped",detail:"sequence_inactive"});
        continue;
      }

      const personalization={full_name:contact.full_name,business_name:lead.business_name,recommended_service:lead.recommended_service};
      const resolvedSubject=renderOutreachSubject(message.subject,personalization);
      const resolvedBody=renderOutreachText(message.body,personalization);
      if(!resolvedSubject||!resolvedBody)throw new Error("Autopilot template rendered empty content.");
      const {error:freezeError}=await db.from("crm_outreach_messages").update({subject:resolvedSubject,body:resolvedBody,updated_at:new Date().toISOString()}).eq("id",message.id).eq("status","sending");
      if(freezeError)throw freezeError;
      const formatted=formatAutonomousOutreachEmail(resolvedBody,personalization);
      const response=await client().emails.send({from:OUTREACH_FROM,replyTo:OUTREACH_REPLY_TO,to:[contact.email],subject:resolvedSubject,text:formatted.text,html:formatted.html},{idempotencyKey:`crm-autopilot-${message.id}`});
      if(response.error||!response.data?.id)throw new Error(response.error?.message||"Resend could not accept the Autopilot email.");

      const now=new Date().toISOString();
      const orderedSteps=(steps||[]).map(step=>({step_number:Number(step.step_number),delay_days:Number(step.delay_days)}));
      const currentIndex=orderedSteps.findIndex(step=>step.step_number===Number(message.step_number));
      const currentStep=orderedSteps[currentIndex];
      const nextStep=currentIndex>=0?orderedSteps[currentIndex+1]:undefined;
      const gapDays=nextStep&&currentStep?Math.max(1,nextStep.delay_days-currentStep.delay_days):0;
      const nextSendAt=nextStep?new Date(Date.now()+gapDays*86400000).toISOString():null;

      const [{error:messageUpdateError},{error:enrollmentUpdateError}]=await Promise.all([
        db.from("crm_outreach_messages").update({provider_message_id:response.data.id,status:"sent",sent_at:now,processing_started_at:null,error_message:null,updated_at:now}).eq("id",message.id).eq("status","sending"),
        db.from("crm_lead_enrollments").update({current_step:message.step_number,last_sent_at:now,next_send_at:nextSendAt,status:nextStep?"active":"completed",updated_at:now}).eq("id",message.enrollment_id).eq("status","active"),
      ]);
      if(messageUpdateError||enrollmentUpdateError)throw messageUpdateError||enrollmentUpdateError;

      const leadPatch:Record<string,unknown>={last_contacted_at:now,next_action_at:nextSendAt,updated_at:now};
      if(["new","researching","ready"].includes(String(lead.status)))leadPatch.status="contacted";
      await Promise.all([
        db.from("crm_leads").update(leadPatch).eq("id",lead.id),
        db.from("crm_lead_activities").insert({lead_id:lead.id,activity_type:"outreach_sent",details:{provider:"resend",message_id:response.data.id,automation:"autopilot",step:message.step_number}}),
      ]);
      outcomes.push({id:message.id,outcome:"sent"});
    }catch(error){
      const detail=safeError(error);
      const now=new Date().toISOString();
      await db.from("crm_outreach_messages").update({status:"failed",processing_started_at:null,error_message:detail,updated_at:now}).eq("id",message.id);
      if(Number(message.attempt_count)>=3&&message.enrollment_id)await db.from("crm_lead_enrollments").update({status:"failed",next_send_at:null,updated_at:now}).eq("id",message.enrollment_id);
      console.error("[crm][autopilot] send failed",{messageId:message.id,error:detail});
      outcomes.push({id:message.id,outcome:"failed",detail});
    }
  }
  return {status:"ok",processed:outcomes.length,enrolled:Number(enrolled||0),queued:Number(queued||0),outcomes};
}
