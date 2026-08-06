import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { monitoringConfig } from "@/lib/monitoring/config";
import { recordIncident } from "@/lib/monitoring/incidents";
import { safeLog } from "@/lib/monitoring/logger";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const db = createAdminClient(); const now = Date.now();
    const [support, refills, degraded] = await Promise.all([
      db.from("support_tickets").select("id", { count: "exact", head: true }).in("status", ["open", "waiting_for_support"]).lt("updated_at", new Date(now - monitoringConfig.supportWarningHours * 3_600_000).toISOString()),
      db.from("order_refill_requests").select("id", { count: "exact", head: true }).in("status", ["requested", "reviewing", "approved", "processing"]).lt("requested_at", new Date(now - monitoringConfig.refillWarningHours * 3_600_000).toISOString()),
      db.from("services").select("id", { count: "exact", head: true }).or("accepts_new_orders.eq.false,health_status.in.(limited,paused,maintenance)"),
    ]);
    if ((support.count || 0) > 0) await recordIncident({ type: "support_backlog", severity: "high", title: "Support backlog needs review", summary: `${support.count} support tickets exceed the configured age threshold.`, source: "scheduled_monitor", fingerprint: "support-backlog", metadata: { count: support.count } });
    if ((refills.count || 0) > 0) await recordIncident({ type: "refill_backlog", severity: "high", title: "Refill backlog needs review", summary: `${refills.count} refill requests exceed the configured age threshold.`, source: "scheduled_monitor", fingerprint: "refill-backlog", metadata: { count: refills.count } });
    if ((degraded.count || 0) > 0) await recordIncident({ type: "service_health", severity: "medium", title: "Service availability is degraded", summary: `${degraded.count} services are limited, paused, or in maintenance.`, source: "scheduled_monitor", fingerprint: "service-health-degraded", metadata: { count: degraded.count } });
    return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch (error) { safeLog("error", "scheduled_monitoring_failed", { category: error instanceof Error ? error.name : "unknown" }); return NextResponse.json({ error: "Monitoring check failed" }, { status: 503 }); }
}
