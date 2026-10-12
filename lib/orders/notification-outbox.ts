import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { orderNotificationKey, type OrderNoticeKind } from "./notification-policy";

/** Idempotent queue insertion. Does not send messages; migration must be applied before use. */
export async function enqueueOrderNotice(orderId: string, kind: OrderNoticeKind, recipientEmail: string | null) {
  const email = recipientEmail?.trim().toLowerCase() || null;
  const { error } = await createAdminClient()
    .from("order_notification_outbox")
    .upsert({
      order_id: orderId,
      event_kind: kind,
      event_key: orderNotificationKey(orderId, kind),
      recipient_email: email,
    }, { onConflict: "event_key", ignoreDuplicates: true });
  if (error) throw error;
}

/** The queue must be claimed atomically before delivery to prevent concurrent cron workers. */
export async function claimOrderNoticeBatch(limit = 20, testRecipient?: string) {
  const { data, error } = await createAdminClient().rpc("claim_order_notification_batch", { p_limit: limit, p_test_recipient: testRecipient || null });
  if (error) throw error;
  return data ?? [];
}
