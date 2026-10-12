import { NextRequest, NextResponse } from "next/server";
import { deliverOrderNotificationBatch } from "@/lib/orders/notification-delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json(await deliverOrderNotificationBatch());
  } catch (error) {
    console.error("[order-notifications] worker failed", error);
    return NextResponse.json({ error: "Notification processing failed" }, { status: 500 });
  }
}
