/** First-party, consent-aware interaction events. Financial outcomes are server-only. */
import { browserAnalyticsAllowed } from "./browser-consent.ts";
import { analyticsPathBucket, coarseAttribution, privateSafeMetadata } from "./privacy.ts";
import { activeSmmServices } from "../smm-service-catalog.ts";

export const clientAnalyticsEvents = [
  "page_viewed",
  "sign_up_started",
  "service_viewed",
  "service_selected",
  "package_viewed",
  "package_selected",
  "new_order_clicked",
  "order_platform_selected",
  "order_started",
  "order_draft_saved",
  "order_draft_discarded",
  "order_details_completed",
  "checkout_started",
  "payment_started",
  "payment_method_selected",
  "payment_funnel_step",
  "payment_exit",
  "payment_help_clicked",
  "payment_returned",
  "utr_submitted",
  "checkout_error",
  "checkout_recovery_view",
  "checkout_recovery_click","email_recovery_click",
  "creator_tool_used",
  "creator_tool_result_generated",
  "blog_article_viewed",
  "blog_service_cta_clicked",
  "blog_tool_cta_clicked",
  "creator_tool_service_cta_clicked",
  "organic_landing_view",
  "cross_sell_view",
  "cross_sell_click",
  "bundle_view",
  "bundle_click",
  "repeat_order_click",
  "order_success_recommendation_view",
  "order_success_recommendation_click",
  "market_hub_viewed",
  "recent_service_opened",
  "continue_order_clicked",
  "related_service_clicked",
  "bulk_inquiry_clicked",
  "lead_whatsapp_clicked",
  "qualified_lead_submitted",
  "referral_share_clicked",
  "referral_landing_view",
  "referral_signup_attributed",
  "referral_center_view",
  "campaign_stack_growth_path_click",
  "repeat_growth_path_click",
  "dashboard_repeat_scale_click",
  "retention_next_action_view",
  "retention_next_action_click",
  "package_growth_path_click",
  "homepage_conversion_path_click",
  "agency_bulk_form_view",
  "agency_bulk_form_incomplete",
  "agency_bulk_form_error",
  "agency_revenue_path_click",
  "agency_growth_next_action_view",
  "agency_growth_next_action_click",
  "web_vital",
  "experiment_exposure",
  "first_order_bonus_view",
  "first_order_bonus_click",
  "marketing_opt_in_selected",
] as const;

export const trustedAnalyticsEvents = [
  "sign_up_completed",
  "login_completed",
  "payment_completed",
  "payment_failed",
  "wallet_topup_completed",
  "wallet_order_completed",
  "order_created",
  "refill_requested",
  "support_ticket_created",
  "support_reply_sent",
  "review_submitted",
] as const;

export type ClientAnalyticsEvent = (typeof clientAnalyticsEvents)[number];
export type AnalyticsValue = string | number | boolean | null;
export type AnalyticsProperties = Record<string, AnalyticsValue>;

type ClientAttribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  referringDomain?: string;
  landingPath?: string;
};

const ATTRIBUTION_KEY = "sr_first_touch_attribution_v1";
const sent = new Set<string>();
// These events originate from deliberate user interactions; a later click with
// identical selections is still a real order-funnel action, not an effect remount.
const repeatableInteractionEvents = new Set<ClientAnalyticsEvent>([
  "package_selected",
  "new_order_clicked",
]);

const safePath = () =>
  typeof location === "undefined" ? "/" : analyticsPathBucket(location.pathname);

const searchSource = (hostname: string) => {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  // Search uses the public root/country hosts and dedicated search surfaces.
  // Other Google products (accounts, mail, docs, ads, etc.) are referrals.
  // Anchor the whole hostname so google.com.example cannot count as search.
  if (/^(?:(?:images|news|search)\.)?google\.(?:com|cat|[a-z]{2}|(?:co|com)\.[a-z]{2})$/.test(host)) return "google";
  if (/(^|\.)bing\.com$/.test(host)) return "bing";
  if (/(^|\.)duckduckgo\.com$/.test(host)) return "duckduckgo";
  if (/(^|\.)search\.yahoo\./.test(host) || /(^|\.)yahoo\./.test(host)) return "yahoo";
  if (/(^|\.)yandex\./.test(host)) return "yandex";
  if (/(^|\.)baidu\.com$/.test(host)) return "baidu";
  return undefined;
};

// Click markers are used only for classification; their values are never stored.
const paidSearchSource = (params: URLSearchParams) => {
  if (["gclid", "gbraid", "wbraid", "dclid"].some(key => params.has(key))) return "google";
  if (params.has("msclkid")) return "bing";
  return undefined;
};

/** Organic acquisition must begin on a public page, not a customer account
 * or ordering route—even when the initial document had a search referrer. */
const privateOrganicLandingRoots = new Set([
  "dashboard", "admin", "api", "auth", "login", "register", "forgot-password",
  "reset-password", "verify-email", "account", "wallet", "orders", "billing",
  "new-campaign", "order-summary", "checkout", "order", "payment",
]);

export function isPublicOrganicLandingPath(pathname: string): boolean {
  const path = pathname.split(/[?#]/, 1)[0];
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  const segments = path.split("/").filter(Boolean);
  const root = segments[0]?.toLowerCase();
  if (!root) return true;
  if (privateOrganicLandingRoots.has(root)) return false;
  if (root === "packages" && ["summary", "checkout"].includes(segments[1]?.toLowerCase() ?? "")) return false;
  if (root === "support" && segments.length > 1) return false;
  return true;
}

/** Recognize an external search-engine document referrer without transmitting its URL. */
export function isOrganicSearchReferrer(referrerUrl: string, currentHostname: string): boolean {
  if (!referrerUrl || !currentHostname) return false;
  try {
    const referrer = new URL(referrerUrl);
    if (referrer.protocol !== "https:" && referrer.protocol !== "http:") return false;
    const host = referrer.hostname.toLowerCase().replace(/^www\./, "");
    const current = currentHostname.toLowerCase().replace(/^www\./, "");
    return host !== current && Boolean(searchSource(host));
  } catch {
    return false;
  }
}

/** Classify the current public landing, independently of stored first-touch data. */
export function isOrganicSearchLanding(
  referrerUrl: string,
  currentHostname: string,
  pathname: string,
  landingSearch: string,
): boolean {
  if (!isOrganicSearchReferrer(referrerUrl, currentHostname) || !isPublicOrganicLandingPath(pathname)) return false;
  const params = new URLSearchParams(landingSearch);
  if (paidSearchSource(params)) return false;
  const medium = params.get("utm_medium")?.trim().toLowerCase();
  if (medium && medium !== "organic") return false;
  const source = params.get("utm_source")?.trim().toLowerCase();
  const referrerSource = searchSource(new URL(referrerUrl).hostname);
  return !source || source === referrerSource;
}

function getFirstTouchAttribution(): ClientAttribution {
  if (!browserAnalyticsAllowed()) return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const googlePaid = ["gclid","gbraid","wbraid","dclid"].some(key=>params.has(key));
    const bingPaid = params.has("msclkid");
    const explicit = ["utm_source","utm_medium"].some(key=>params.has(key));
    if(!googlePaid && !bingPaid && !explicit) {
      const stored=JSON.parse(window.sessionStorage.getItem(ATTRIBUTION_KEY)||"null");
      if(stored && typeof stored.source==="string" && typeof stored.medium==="string") {
        const safe=coarseAttribution(stored);
        window.sessionStorage.setItem(ATTRIBUTION_KEY,JSON.stringify(safe));
        return safe;
      }
    }
    let source = googlePaid ? "google" : bingPaid ? "bing" : params.get("utm_source") || "direct";
    let medium = googlePaid || bingPaid ? "paid" : params.get("utm_medium") || "none";
    if (!googlePaid && !bingPaid && !explicit && document.referrer) {
      const referrer = new URL(document.referrer);
      const organic = searchSource(referrer.hostname);
      source = organic || "referral"; medium = organic ? "organic" : "referral";
    }
    const safe = coarseAttribution({source,medium});
    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(safe));
    return safe;
  } catch { return {}; }
}

export function primeAttribution() {
  if (!browserAnalyticsAllowed()) { sent.clear(); return; }
  void getFirstTouchAttribution();
}

export function track(
  event: ClientAnalyticsEvent,
  metadata: AnalyticsProperties = {},
) {
  if (!browserAnalyticsAllowed()) { sent.clear(); return; }

  // Count real return visits (A -> B -> A) instead of deduplicating all page
  // views on the same URL for the lifetime of this document.
  // Organic landings, however, must be counted once per document even if the
  // analytics component remounts on a different client-side route.
  if (event !== "page_viewed" && !repeatableInteractionEvents.has(event)) {
    const key =
      event === "organic_landing_view"
        ? event
        : `${event}:${safePath()}:${JSON.stringify(metadata)}`;
    if (sent.has(key)) return;
    sent.add(key);
  }

  const { service_code, platform, ...safeMetadata } = metadata;
  const body = JSON.stringify({
    event,
    eventId: window.crypto.randomUUID(),
    pagePath: safePath(),
    serviceCode: typeof service_code === "string" && activeSmmServices.some(s => s.code === service_code) ? service_code : undefined,
    platform: typeof platform === "string" && ["instagram","youtube","linkedin","facebook","tiktok","telegram","x"].includes(platform) ? platform : undefined,
    metadata: privateSafeMetadata(safeMetadata),
    attribution: getFirstTouchAttribution(),
  });
  if (body.length > 4096) return;

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/analytics",
        new Blob([body], { type: "application/json" }),
      );
      return;
    }
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* Analytics must never affect the customer action. */
  }
}
