/** First-party, consent-aware interaction events. Financial outcomes are server-only. */
export const clientAnalyticsEvents = [
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
  "payment_returned",
  "utr_submitted",
  "checkout_error",
  "checkout_recovery_view",
  "checkout_recovery_click",
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
  "campaign_stack_growth_path_click",
  "repeat_growth_path_click",
  "dashboard_repeat_scale_click",
  "package_growth_path_click",
  "agency_bulk_form_view",
  "agency_bulk_form_incomplete",
  "agency_bulk_form_error",
  "agency_revenue_path_click",
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

const safePath = () =>
  typeof location === "undefined" ? "/" : location.pathname.slice(0, 300);

const clip = (value: string | null | undefined, length: number) => {
  const cleaned = value?.trim();
  return cleaned ? cleaned.slice(0, length) : undefined;
};

const searchSource = (hostname: string) => {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  if (/(^|\.)google\./.test(host)) return "google";
  if (/(^|\.)bing\.com$/.test(host)) return "bing";
  if (/(^|\.)duckduckgo\.com$/.test(host)) return "duckduckgo";
  if (/(^|\.)search\.yahoo\./.test(host) || /(^|\.)yahoo\./.test(host)) return "yahoo";
  if (/(^|\.)yandex\./.test(host)) return "yandex";
  if (/(^|\.)baidu\.com$/.test(host)) return "baidu";
  return undefined;
};

const sanitizeAttribution = (value: unknown): ClientAttribution | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const landingPath =
    typeof raw.landingPath === "string" && raw.landingPath.startsWith("/")
      ? raw.landingPath.split("?")[0].slice(0, 300)
      : undefined;
  const result: ClientAttribution = {
    source: typeof raw.source === "string" ? clip(raw.source, 100) : undefined,
    medium: typeof raw.medium === "string" ? clip(raw.medium, 100) : undefined,
    campaign: typeof raw.campaign === "string" ? clip(raw.campaign, 150) : undefined,
    content: typeof raw.content === "string" ? clip(raw.content, 150) : undefined,
    term: typeof raw.term === "string" ? clip(raw.term, 150) : undefined,
    referringDomain:
      typeof raw.referringDomain === "string"
        ? clip(raw.referringDomain, 150)
        : undefined,
    landingPath,
  };
  return Object.values(result).some(Boolean) ? result : null;
};

function getFirstTouchAttribution(): ClientAttribution {
  if (typeof window === "undefined") return {};

  try {
    const params = new URLSearchParams(window.location.search);
    const explicitCampaign = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
    ].some((key) => Boolean(params.get(key)?.trim()));

    if (!explicitCampaign) {
      const stored = sanitizeAttribution(
        JSON.parse(window.sessionStorage.getItem(ATTRIBUTION_KEY) || "null"),
      );
      if (stored) return stored;
    }

    let referringDomain: string | undefined;
    try {
      const referrer = document.referrer ? new URL(document.referrer) : null;
      if (referrer && referrer.hostname !== window.location.hostname) {
        referringDomain = clip(referrer.hostname.toLowerCase(), 150);
      }
    } catch {
      // A malformed browser referrer is ignored.
    }

    const organicSource = referringDomain ? searchSource(referringDomain) : undefined;
    const hasGoogleAdClick =
      params.has("gclid") || params.has("gbraid") || params.has("wbraid");
    const hasBingAdClick = params.has("msclkid");

    const attribution: ClientAttribution = {
      source:
        clip(params.get("utm_source"), 100) ||
        (hasGoogleAdClick ? "google" : undefined) ||
        (hasBingAdClick ? "bing" : undefined) ||
        organicSource ||
        referringDomain ||
        "direct",
      medium:
        clip(params.get("utm_medium"), 100) ||
        (hasGoogleAdClick || hasBingAdClick
          ? "paid"
          : organicSource
            ? "organic"
            : referringDomain
              ? "referral"
              : "none"),
      campaign: clip(params.get("utm_campaign"), 150),
      content: clip(params.get("utm_content"), 150),
      term: clip(params.get("utm_term"), 150),
      referringDomain,
      landingPath: safePath(),
    };

    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
    return attribution;
  } catch {
    return {};
  }
}

export function track(
  event: ClientAnalyticsEvent,
  metadata: AnalyticsProperties = {},
) {
  if (typeof window === "undefined" || navigator.doNotTrack === "1") return;

  const key = `${event}:${safePath()}:${JSON.stringify(metadata)}`;
  if (sent.has(key)) return;
  sent.add(key);

  const { service_code, platform, ...safeMetadata } = metadata;
  const body = JSON.stringify({
    event,
    pagePath: safePath(),
    serviceCode: typeof service_code === "string" ? service_code : undefined,
    platform: typeof platform === "string" ? platform : undefined,
    metadata: safeMetadata,
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
