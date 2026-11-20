import "server-only";
import { cookies, headers } from "next/headers";
import { createHash } from "node:crypto";
import { authorizeOptionalEvent, type ConsentRepository } from "./consent-authority";
import { CONSENT_COOKIE } from "./privacy";

/** Deliberately unconfigured. Installing a durable adapter, setting activation
 * flags or deploying requires a separate approved consent/retention review. */
export function consentRepository(): ConsentRepository | null { return null; }
export const consentEnvironment = () => ({ enabled: process.env.OPTIONAL_ANALYTICS_ENABLED, deployment: process.env.VERCEL_ENV, dataset: process.env.ANALYTICS_DATASET });
export async function authorizeTrustedAnalytics(eventId: string) {
  const repo = consentRepository(); if (!repo) return null;
  try {
    const h = await headers(); const c = await cookies();
    const request = new Request(`https://${h.get("host") || "invalid"}/api/analytics`, { headers: h });
    const id = "server:" + createHash("sha256").update(eventId).digest("hex");
    const receipt = c.get(CONSENT_COOKIE)?.value;
    return await authorizeOptionalEvent(request, receipt, id, repo, consentEnvironment()) ? { eventId: id, sessionId: receipt! } : null;
  } catch { return null; } // workers and failures never fall back to unconsented capture
}
