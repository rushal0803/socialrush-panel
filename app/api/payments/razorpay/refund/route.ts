import { NextResponse } from "next/server";

// Retired compatibility URL: no provider call, balance reservation or financial mutation.
export async function POST() {
  return NextResponse.json({ error: "Gateway refunds are retired. Contact support for a reviewed refund of historical payments." }, { status: 410, headers: { "Cache-Control": "no-store" } });
}
