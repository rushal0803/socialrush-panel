import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { trustedAnalyticsEvents, type AnalyticsProperties } from "./events";

export type TrustedAnalyticsEvent = typeof trustedAnalyticsEvents[number];
const safeMetadata = (value: AnalyticsProperties = {}) => Object.fromEntries(
  Object.entries(value).filter(([key, item]) => /^[a-z_]{1,40}$/.test(key) && ["string", "number", "boolean"].includes(typeof item)).slice(0, 12),
);

/** Best-effort append-only audit signal; business state is committed before this runs. */
export async function recordTrustedEvent(input: {
  eventName: TrustedAnalyticsEvent; customerId: string; pagePath: string; eventId: string;
  metadata?: AnalyticsProperties;
}) {
  try {
    await createAdminClient().from("analytics_events").upsert({
      event_name: input.eventName, customer_id: input.customerId, event_id: input.eventId,
      page_path: input.pagePath.startsWith("/") ? input.pagePath.slice(0, 300) : "/",
      device_category: "unknown", safe_metadata: safeMetadata(input.metadata),
    }, { onConflict: "event_id", ignoreDuplicates: true });
  } catch { /* Do not roll back a verified payment, ledger entry, or order. */ }
}
