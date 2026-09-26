import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { trustedAnalyticsEvents, type AnalyticsProperties } from "./events";

export type TrustedAnalyticsEvent = (typeof trustedAnalyticsEvents)[number];

const safeMetadata = (value: AnalyticsProperties = {}) =>
  Object.fromEntries(
    Object.entries(value)
      .filter(
        ([key, item]) =>
          /^[a-z_]{1,40}$/.test(key) &&
          ["string", "number", "boolean"].includes(typeof item),
      )
      .slice(0, 12),
  );

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
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("analytics_events")
      .select(
        "anonymous_session_id,source,medium,campaign,content,term,referring_domain,safe_metadata",
      )
      .eq("customer_id", input.customerId)
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
    if (attribution?.source) {
      metadata.attribution_model = "first_touch_inherited";
    }

    await admin.from("analytics_events").upsert(
      {
        event_name: input.eventName,
        anonymous_session_id: attribution?.anonymous_session_id || null,
        customer_id: input.customerId,
        event_id: input.eventId,
        page_path: input.pagePath.startsWith("/")
          ? input.pagePath.slice(0, 300)
          : "/",
        device_category: "unknown",
        source: attribution?.source || null,
        medium: attribution?.medium || null,
        campaign: attribution?.campaign || null,
        content: attribution?.content || null,
        term: attribution?.term || null,
        referring_domain: attribution?.referring_domain || null,
        safe_metadata: safeMetadata(metadata),
      },
      { onConflict: "event_id", ignoreDuplicates: true },
    );
  } catch {
    /* Do not roll back a verified payment, ledger entry, or order. */
  }
}
