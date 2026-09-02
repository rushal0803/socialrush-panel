import "server-only";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { ingestInboundReply } from "./reply-ingestion";
import { isLeadContactOutreachEligible } from "./outreach";
import { formatOutreachEmail, renderOutreachSubject } from "./email-formatting";
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

export async function handleResendWebhook(event: ResendEvent, eventId: string) {
  const eventType = String(event.type || "");
  if (!eventId || !["email.received", "email.bounced"].includes(eventType)) return { ignored: true };
  const claim = await beginEvent(eventId, eventType);
  webhookLog("claim", { eventType, eventId, status: claim });
  if (claim === "duplicate") return { duplicate: true };
  if (claim === "in_progress") return { inProgress: true };
  try {
    const result = eventType === "email.received" ? await receive(event.data || {}) : await bounce(event.data || {});
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

export async function sendApprovedResendDraft(messageId: string) {
  const db = createAdminClient();
  const { data:message, error } = await db.from("crm_outreach_messages").select("*").eq("id", messageId).eq("direction", "outbound").eq("status", "draft").maybeSingle();
  if (error || !message) throw new Error("Approved outreach draft not found.");
  const [{ data:contact }, { data:lead }, { data:settings }, { data:suppressions }] = await Promise.all([
    db.from("crm_lead_contacts").select("*").eq("id", message.contact_id).maybeSingle(), db.from("crm_leads").select("*").eq("id", message.lead_id).maybeSingle(),
    db.from("crm_outreach_settings").select("*").limit(1).maybeSingle(), db.from("crm_suppression_list").select("email"),
  ]);
  if (!contact || !lead || !settings || settings.provider !== "resend" || !settings.enabled || settings.auto_send || !isLeadContactOutreachEligible(contact as CRMLeadContact, lead as Pick<CRMLead, "status">, settings as CRMOutreachSettings, (suppressions || []) as CRMSuppressionEntry[])) throw new Error("This draft is not eligible for Resend delivery.");
  const personalization = { full_name: contact.full_name, business_name: lead.business_name, recommended_service: lead.recommended_service };
  const formatted = formatOutreachEmail(message.body, personalization);
  const response = await client().emails.send({ from: OUTREACH_FROM, replyTo: OUTREACH_REPLY_TO, to: [contact.email], subject: renderOutreachSubject(message.subject, personalization), text: formatted.text, html: formatted.html }, { idempotencyKey: `crm-outreach-${message.id}` });
  if (response.error || !response.data?.id) throw new Error(response.error?.message || "Resend could not accept the draft.");
  const now = new Date().toISOString();
  await db.from("crm_outreach_messages").update({ provider: "resend", provider_message_id: response.data.id, status: "sent", sent_at: now, updated_at: now }).eq("id", message.id).is("provider_message_id", null);
  await db.from("crm_lead_activities").insert({ lead_id: message.lead_id, activity_type: "outreach_sent", details: { provider: "resend", message_id: response.data.id } });
  return { id: response.data.id };
}
