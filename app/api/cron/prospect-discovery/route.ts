import { NextRequest, NextResponse } from "next/server";
import { runProspectDiscovery } from "@/lib/crm/prospect-discovery";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (
    !secret ||
    request.headers.get("authorization") !== `Bearer ${secret}`
  ) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const result = await runProspectDiscovery({
      trigger: "cron",
      createdBy: null,
    });

    return NextResponse.json({
      status: "ok",
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Prospect discovery failed.";

    console.error("prospect_discovery_cron_failed", {
      message,
    });

    return NextResponse.json(
      {
        error: "Prospect discovery failed",
        message,
      },
      { status: 500 },
    );
  }
}