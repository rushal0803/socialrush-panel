import { NextRequest, NextResponse } from "next/server";
import { getDisplayCurrencyForCountry } from "@/lib/currency";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const currency = getDisplayCurrencyForCountry(request.headers.get("x-vercel-ip-country"));
  return NextResponse.json(
    { currency },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}
