export type CustomerNotificationType =
  | "order_created"
  | "order_status"
  | "order_completed"
  | "refund"
  | "refill"
  | "support_reply"
  | "account_action"
  | "abandoned_order"
  | string;

export function notificationActionLabel(type: CustomerNotificationType, href?: string | null) {
  if (type === "support_reply") return "Open support";
  if (type === "abandoned_order") return "Resume order";
  if (type === "refill") return "Track refill";
  if (type === "refund") return "Review order";
  if (type === "order_completed") return "View completed order";
  if (type === "order_created" || type === "order_status") return "Track order";
  if (href?.startsWith("/dashboard/orders/")) return "View order";
  return "Open update";
}

export function notificationContextLabel(type: CustomerNotificationType) {
  if (type === "support_reply") return "Support";
  if (type === "abandoned_order") return "Saved order";
  if (type === "refill") return "Refill";
  if (type === "refund") return "Refund";
  if (type === "order_completed") return "Completed";
  if (type === "order_created" || type === "order_status") return "Order";
  return "Account";
}
