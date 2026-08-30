import { NextResponse } from "next/server";
import { getExchangeRates } from "@/lib/fx-rates";

export const revalidate = 21600;

export async function GET() {
  return NextResponse.json({ rates: await getExchangeRates(), base: "INR" }, {
    headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" },
  });
}
