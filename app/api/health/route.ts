import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { monitoringConfig } from "@/lib/monitoring/config";
import { safeLog } from "@/lib/monitoring/logger";

export const dynamic = "force-dynamic";
export async function GET() {
  const timestamp = new Date().toISOString();
  try {
    const result = await Promise.race([createAdminClient().from("services").select("id", { head: true, count: "exact" }).limit(1), new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), monitoringConfig.healthTimeoutMs))]);
    if (result.error) throw result.error;
    return NextResponse.json({ status: "ok", timestamp, services: { app: "ok", database: "ok" } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    safeLog("warn", "health_database_unavailable", { category: error instanceof Error ? error.name : "unknown" });
    return NextResponse.json({ status: "degraded", timestamp, services: { app: "ok", database: "unavailable" } }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
