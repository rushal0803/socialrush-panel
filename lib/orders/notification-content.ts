import type { OrderNoticeKind } from "./notification-policy";

export type OrderNoticeContent = { subject: string; heading: string; message: string };

export function orderNoticeContent(kind: OrderNoticeKind, reference: string): OrderNoticeContent {
  const messages: Record<OrderNoticeKind, [string, string]> = {
    order_placed: ["Order received", "We have received your order. If payment verification is required, processing will begin after payment is confirmed."],
    payment_verified: ["Payment confirmed", "Your payment is confirmed. Visit your dashboard for the latest order status."],
    processing_started: ["Order processing", "Your order is being processed. Delivery times depend on the selected service."],
    order_completed: ["Order marked completed", "Your order is marked completed. Verified delivery counts, when available, are shown separately in your dashboard."],
    order_attention: ["Order needs attention", "Please review your order status and contact support if you need help."],
  };
  const [heading, message] = messages[kind];
  return { subject: `SocialRUSH: ${heading} — ${reference}`, heading, message };
}
