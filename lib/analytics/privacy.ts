/** Shared candidate privacy boundary. Activation requires separate owner approval. */
export const CONSENT_COOKIE = "sr_optional_consent";
export const CHOICE_COOKIE = "sr_optional_choice";
export const CONSENT_VERSION = 1;
export const CANONICAL_ANALYTICS_ORIGIN = "https://www.getsocialrush.com";

export function productionCollectionAllowed(origin: string, env: { enabled?: string; deployment?: string; dataset?: string }) {
  return env.enabled === "true" && env.deployment === "production" && env.dataset === "production" && origin === CANONICAL_ANALYTICS_ORIGIN;
}
export function privacyOptOut(dnt: unknown, gpc: unknown) { return dnt === "1" || dnt === 1 || gpc === true || gpc === "1"; }
export function analyticsPathBucket(path: string) {
  const root = path.split(/[?#]/, 1)[0].split("/").filter(Boolean)[0] || "";
  if (!root) return "/";
  if (["services", "packages", "pricing", "blog", "tools", "trust", "contact"].includes(root)) return `/${root}`;
  if (/^(buy-|instagram-|youtube-|linkedin-|facebook-|twitter-|tiktok-|telegram-)/.test(root)) return "/service";
  return "/other";
}
const categorical: Record<string, readonly string[]> = {
  metric: ["LCP","INP","CLS","FCP","TTFB"], rating: ["good","needs-improvement","poor"],
  navigation_type: ["navigate","reload","back-forward","back-forward-cache","prerender","restore","unknown"],
  page_template: ["home","services","service-detail","packages","blog-article","blog-index","country-landing","country-hub","pricing","other-public"],
  method: ["wallet","upi","card","cashfree","razorpay","manual_upi"],
  currency: ["INR","USD","EUR","GBP","AED"],
  step: ["compare","order","budget","growth_check","how_it_works","review","details","payment"],
  surface: ["homepage_hero","homepage_decision_rail","service_order_card"],
};
/** Unknown/free-text strings are discarded, even when supplied under a known key. */
export function privateSafeMetadata(raw: Record<string, unknown> = {}) {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (categorical[key]?.includes(value as string)) out[key] = value as string;
    else if (["quantity","total","value"].includes(key) && typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1e9) out[key] = value;
    else if (["validation_passed","reorder"].includes(key) && typeof value === "boolean") out[key] = value;
    else if (key === "release" && typeof value === "string" && /^(?:[a-f0-9]{12}|unknown)$/.test(value)) out[key] = value;
  }
  return out;
}
export function coarseAttribution(raw: Record<string, unknown> = {}) {
  const source = ["google","bing","direct","referral"].includes(raw.source as string) ? String(raw.source) : "unknown";
  const medium = ["organic","paid","referral","none"].includes(raw.medium as string) ? String(raw.medium) : "unknown";
  return { source, medium };
}
