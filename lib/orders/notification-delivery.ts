import "server-only";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { claimOrderNoticeBatch } from "./notification-outbox";
import { orderNoticeContent } from "./notification-content";
import type { OrderNoticeKind } from "./notification-policy";

const MAX_ATTEMPTS = 5;
const FROM = "SocialRUSH <support@getsocialrush.com>";

export async function deliverOrderNotificationBatch() {
  if (process.env.ORDER_NOTIFICATIONS_ENABLED !== "true") return { enabled: false, processed: 0 };
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  const resend = new Resend(apiKey);
  const db = createAdminClient();
  const batch = await claimOrderNoticeBatch(20);
  let sent = 0;
  let failed = 0;
  for (const notice of batch) {
    const email = String(notice.recipient_email || "").trim();
    const kind = notice.event_kind as OrderNoticeKind;
    const attempt = Number(notice.attempts || 1);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      await db.from("order_notification_outbox").update({ status: "suppressed", last_error: "No valid recipient", updated_at: new Date().toISOString() }).eq("id", notice.id).eq("status", "sending");
      continue;
    }
    try {
      const content = orderNoticeContent(kind, String(notice.order_id).slice(0, 8));
      const { data, error } = await resend.emails.send({
        from: FROM,
        to: email,
        replyTo: "support@getsocialrush.com",
        subject: content.subject,
        text: `${content.heading}\n\n${content.message}\n\nView your order: https://www.getsocialrush.com/dashboard/orders/${notice.order_id}\n\nSocialRUSH Support`,
      }, { idempotencyKey: notice.event_key });
      if (error || !data?.id) throw new Error(error?.message || "Email provider did not accept message");
      const { data: saved, error: saveError } = await db.from("order_notification_outbox").update({ status: "sent", provider_message_id: data.id, sent_at: new Date().toISOString(), last_error: null, updated_at: new Date().toISOString() }).eq("id", notice.id).eq("status", "sending").select("id").maybeSingle();
      if (saveError || !saved) throw saveError ?? new Error("Notification claim was lost before delivery acknowledgement");
      sent++;
    } catch (error) {
      const message = error instanceof Error ? error.message.slice(0, 400) : "Email delivery failed";
      const final = attempt >= MAX_ATTEMPTS;
      const delay = Math.min(60, 2 ** attempt);
      await db.from("order_notification_outbox").update({
        status: final ? "failed" : "retry",
        last_error: message,
        next_attempt_at: new Date(Date.now() + delay * 60_000).toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", notice.id).eq("status", "sending");
      failed++;
    }
  }
  return { enabled: true, processed: batch.length, sent, failed };
}
