/** Pure notification policy; delivery is deliberately not wired until an idempotent outbox is available. */
export type OrderNoticeKind = "order_placed" | "payment_verified" | "processing_started" | "order_completed" | "order_attention";
export type OrderNoticeState = { status: string; paymentStatus: string | null };

export function orderNotificationEvents(previous: OrderNoticeState | null, next: OrderNoticeState): OrderNoticeKind[] {
  const events: OrderNoticeKind[] = [];
  if (!previous) events.push("order_placed");
  const paid = (value: string | null) => ["paid", "completed"].includes(String(value || "").toLowerCase());
  if (paid(next.paymentStatus) && !paid(previous?.paymentStatus ?? null)) events.push("payment_verified");
  if (next.status === "processing" && previous?.status !== "processing" && paid(next.paymentStatus)) events.push("processing_started");
  if (next.status === "completed" && previous?.status !== "completed" && paid(next.paymentStatus)) events.push("order_completed");
  if (["failed", "cancelled"].includes(next.status) && previous?.status !== next.status) events.push("order_attention");
  return events;
}

/** A stable key for durable, once-per-order event delivery. Persist with a unique constraint in an outbox before enabling sends. */
export function orderNotificationKey(orderId: string, kind: OrderNoticeKind): string {
  return `order:${orderId}:${kind}`;
}
