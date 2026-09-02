export type LifecycleStage = "lead" | "new_customer" | "active" | "vip" | "at_risk" | "inactive";
export type CrmPriority = "low" | "normal" | "high";
export type FollowUpType = "general" | "sales" | "support" | "payment" | "refill" | "retention";
export type FollowUpStatus = "pending" | "completed" | "cancelled";

export type CrmAutomationSettings = {
  id: string; enabled: boolean; new_customer_days: number; at_risk_days: number; inactive_days: number;
  high_value_percentile: number; vip_percentile: number; vip_min_orders: number;
  create_retention_followups: boolean; create_support_followups: boolean; create_refill_followups: boolean; updated_at: string | null;
};
export type AutomationRunStatus = "running" | "completed" | "failed";
export type AutomationRunDetails = { high_value_threshold?: number; vip_threshold?: number; new_customer_days?: number; at_risk_days?: number; inactive_days?: number };
export type CrmAutomationRun = {
  id: string; started_at: string; completed_at: string | null; status: AutomationRunStatus;
  customers_scanned: number; profiles_touched: number; tags_removed: number; tags_added: number;
  followups_created: number; error_message: string | null; details: AutomationRunDetails | null;
};

export type CustomerMetric = {
  totalOrders: number; validOrders: number; totalSpend: number; averageOrderValue: number;
  firstOrderAt: string | null; lastOrderAt: string | null; topPlatform: string | null;
};

export const validOrder = (order: { status?: string | null; payment_status?: string | null }) =>
  !["cancelled", "refunded", "failed"].includes((order.status || "").toLowerCase()) &&
  !["failed", "refunded"].includes((order.payment_status || "").toLowerCase());

export function metricsForOrders(orders: Array<{ charge?: number | string | null; status?: string | null; payment_status?: string | null; created_at?: string | null; platform?: string | null }>): CustomerMetric {
  const valid = orders.filter(validOrder);
  const sorted = [...orders].sort((a, b) => Date.parse(b.created_at || "") - Date.parse(a.created_at || ""));
  const platforms = new Map<string, number>();
  valid.forEach((order) => order.platform && platforms.set(order.platform, (platforms.get(order.platform) || 0) + 1));
  const topPlatform = [...platforms.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const totalSpend = valid.reduce((sum, order) => sum + Number(order.charge || 0), 0);
  return { totalOrders: orders.length, validOrders: valid.length, totalSpend, averageOrderValue: valid.length ? totalSpend / valid.length : 0, firstOrderAt: sorted.at(-1)?.created_at || null, lastOrderAt: sorted[0]?.created_at || null, topPlatform };
}

export const money = (value: number | string | null | undefined) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
export const date = (value?: string | null) => value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "—";
export const dateTime = (value?: string | null) => value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
