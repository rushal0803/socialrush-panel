import "server-only";
import { authorizeTrustedAnalytics } from "./consent-runtime";
import { analyticsPathBucket, coarseAttribution, privateSafeMetadata } from "./privacy";
import { createAdminClient } from "@/lib/supabase/admin";
import { shouldIgnoreAnalyticsCollection } from "./collection-environment";
import { trustedAnalyticsEvents, type AnalyticsProperties } from "./events";

export type TrustedAnalyticsEvent = (typeof trustedAnalyticsEvents)[number];

const safeMetadata = privateSafeMetadata;

type AttributionRow = {
  anonymous_session_id?: string | null;
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  content?: string | null;
  term?: string | null;
  referring_domain?: string | null;
  safe_metadata?: Record<string, unknown> | null;
};

/**
 * Best-effort append-only audit signal; business state is committed before this
 * runs. Trusted financial/order events inherit the customer's latest
 * first-touch attribution so verified outcomes can be connected to acquisition.
 */
export async function recordTrustedEvent(input: {
  eventName: TrustedAnalyticsEvent;
  customerId: string;
  pagePath: string;
  eventId: string;
  metadata?: AnalyticsProperties;
}) {
  // Suppress trusted events in all non-production deployments before admin client creation.
  // Checkout and authentication outcomes still succeed; only analytics is skipped.
  if (shouldIgnoreAnalyticsCollection(undefined, process.env.VERCEL_ENV)) return;
  try {
    const consent = await authorizeTrustedAnalytics(input.eventId);
    if (!consent) return;
    const admin = createAdminClient();
    const { data } = await admin
      .from("analytics_events")
      .select(
        "anonymous_session_id,source,medium,campaign,content,term,referring_domain,safe_metadata",
      )
      .eq("anonymous_session_id", consent.sessionId)
      .not("source", "is", null)
      .order("occurred_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const attribution = (data || null) as AttributionRow | null;
    const metadata: AnalyticsProperties = { ...(input.metadata || {}) };
    const landingPath = attribution?.safe_metadata?.landing_path;
    if (typeof landingPath === "string" && landingPath.startsWith("/")) {
      metadata.landing_path = landingPath.slice(0, 300);
    }
    const recoveryCampaign = attribution?.safe_metadata?.recovery_campaign;
    if (typeof recoveryCampaign === "string" && recoveryCampaign.trim()) {
      metadata.recovery_campaign = recoveryCampaign.trim().slice(0, 80);
    }
    if (attribution?.source) {
      metadata.attribution_model = "first_touch_inherited";
    }

    // event_id is unique only under a partial index (WHERE event_id IS NOT NULL).
    // PostgREST onConflict=event_id cannot infer that index (Postgres 42P10).
    // A plain insert preserves append-only events and the index still rejects
    // duplicate event IDs atomically on retries.
    const { error: writeError } = await admin.from("analytics_events").insert(
      {
        event_name: input.eventName,
        anonymous_session_id: consent.sessionId,
        customer_id: null,
        event_id: consent.eventId,
        page_path: analyticsPathBucket(input.pagePath),
        device_category: "unknown",
        source: coarseAttribution({source: attribution?.source}).source,
        medium: coarseAttribution({medium: attribution?.medium}).medium,
        campaign: null,
        content: null,
        term: null,
        referring_domain: null,
        safe_metadata: safeMetadata(metadata),
      },
    );
    if (writeError && writeError.code !== "23505") {
      // Log only the Postgres error code, never customer or payment details.
      console.error("[trusted-analytics] insert failed", { code: writeError.code });
    }
  } catch {
    // Analytics is best effort and must never undo or block a paid order.
    console.error("[trusted-analytics] unexpected write failure");
  }
}
