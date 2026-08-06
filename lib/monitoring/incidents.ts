import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { monitoringConfig, type IncidentSeverity } from "./config";
import { safeLog, safeMetadata } from "./logger";

export type IncidentInput = { type: string; severity: IncidentSeverity; title: string; summary: string; source: string; fingerprint: string; metadata?: Record<string, unknown>; relatedOrderId?: string; relatedPaymentReference?: string; relatedServiceId?: number };
export async function recordIncident(input: IncidentInput) {
  try {
    const db = createAdminClient();
    const { error } = await db.rpc("record_operational_incident", {
      p_incident_type: input.type.slice(0, 80), p_severity: input.severity, p_title: input.title.slice(0, 160), p_safe_summary: input.summary.slice(0, 500),
      p_source: input.source.slice(0, 80), p_environment: monitoringConfig.environment.slice(0, 40), p_fingerprint: input.fingerprint.slice(0, 180), p_metadata: safeMetadata(input.metadata),
      p_related_order_id: input.relatedOrderId || null, p_related_payment_reference: input.relatedPaymentReference?.slice(0, 120) || null, p_related_service_id: input.relatedServiceId || null,
    });
    if (error) safeLog("error", "incident_record_failed", { category: error.code || "database" });
  } catch (error) { safeLog("error", "incident_record_exception", { category: error instanceof Error ? error.name : "unknown" }); }
}
