/** First-party, consent-aware interaction events. Financial outcomes are server-only. */
export const clientAnalyticsEvents = [
  "sign_up_started", "service_viewed", "service_selected", "package_viewed", "package_selected",
  "order_started", "checkout_started", "payment_started",
  "creator_tool_used", "creator_tool_result_generated", "blog_article_viewed", "blog_service_cta_clicked",
] as const;

export const trustedAnalyticsEvents = [
  "sign_up_completed", "login_completed", "payment_completed", "payment_failed", "wallet_topup_completed",
  "wallet_order_completed", "order_created", "refill_requested", "support_ticket_created",
  "support_reply_sent", "review_submitted",
] as const;

export type ClientAnalyticsEvent = typeof clientAnalyticsEvents[number];
export type AnalyticsValue = string | number | boolean | null;
export type AnalyticsProperties = Record<string, AnalyticsValue>;

const sent = new Set<string>();
const safePath = () => typeof location === "undefined" ? "/" : location.pathname.slice(0, 300);

export function track(event: ClientAnalyticsEvent, metadata: AnalyticsProperties = {}) {
  if (typeof window === "undefined" || navigator.doNotTrack === "1") return;
  const key = `${event}:${safePath()}:${JSON.stringify(metadata)}`;
  if (sent.has(key)) return;
  sent.add(key);
  const body = JSON.stringify({ event, pagePath: safePath(), metadata });
  if (body.length > 4096) return;
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => undefined);
  } catch { /* Analytics must never affect the customer action. */ }
}
