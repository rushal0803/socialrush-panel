import { CHOICE_COOKIE, CANONICAL_ANALYTICS_ORIGIN, privacyOptOut, productionCollectionAllowed } from "./privacy.ts";
const optionalKeys = ["sr_first_touch_attribution_v1", "sr_analytics_pending_session_v1"];
export function clearOptionalBrowserState() {
  if (typeof window === "undefined") return;
  for (const key of optionalKeys) try { window.sessionStorage.removeItem(key); } catch { /* blocked storage */ }
}
export function browserAnalyticsAllowed() {
  if (typeof window === "undefined") return false;
  const allowed = productionCollectionAllowed(window.location.origin, { enabled: process.env.NEXT_PUBLIC_OPTIONAL_ANALYTICS_ENABLED, deployment: process.env.NEXT_PUBLIC_VERCEL_ENV, dataset: process.env.NEXT_PUBLIC_ANALYTICS_DATASET }) &&
    !privacyOptOut(navigator.doNotTrack, (navigator as Navigator & {globalPrivacyControl?: boolean}).globalPrivacyControl) &&
    document.cookie.split(";").some(v => v.trim() === `${CHOICE_COOKIE}=granted.v1`);
  if (!allowed) clearOptionalBrowserState();
  return allowed;
}
export async function setOptionalAnalyticsChoice(choice: "granted" | "denied") {
  if (typeof window === "undefined") return {choice:"denied" as const,confirmed:false};
  // Stop locally before awaiting revocation acknowledgement; never report server
  // withdrawal complete when its durable transaction failed.
  document.cookie = `${CHOICE_COOKIE}=denied.v1; Path=/; SameSite=Lax; Secure`;
  clearOptionalBrowserState();
  if (window.location.origin !== CANONICAL_ANALYTICS_ORIGIN) return {choice:"denied" as const,confirmed:false};
  try {
    const response = await fetch("/api/analytics/consent", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({choice}) });
    const result=await response.json();
    return {choice:result.choice==="granted"?"granted" as const:"denied" as const,confirmed:response.ok && result.confirmed===true};
  } catch { return {choice:"denied" as const,confirmed:false}; }
}
