import { NextRequest, NextResponse } from "next/server";
import { processCrmOutreachAutopilot } from "@/lib/crm/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function supabaseProjectRef() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) return null;
    return new URL(url).hostname.split(".")[0] || null;
  } catch {
    return null;
  }
}

function errorDetail(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 500);
  try { return JSON.stringify(error).slice(0, 500); } catch { return String(error).slice(0, 500); }
}

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processCrmOutreachAutopilot();
    return NextResponse.json({ status: "ok", projectRef: supabaseProjectRef(), ...result });
  } catch (error) {
    const detail = errorDetail(error);
    console.error("[crm][autopilot] cron failed", { error: detail });
    return NextResponse.json({ error: "CRM outreach processing failed", detail, projectRef: supabaseProjectRef() }, { status: 503 });
  }
}
