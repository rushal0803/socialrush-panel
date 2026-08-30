import "server-only";
import { unstable_cache } from "next/cache";
import { type CurrencyRates } from "@/lib/currency";

const symbols = "USD,GBP,EUR,AED";

async function loadRates(): Promise<CurrencyRates> {
  try {
    const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=INR&symbols=${symbols}`, {
      next: { revalidate: 21600 },
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`FX provider returned ${response.status}`);
    const payload = await response.json() as { rates?: Record<string, unknown> };
    const rates: CurrencyRates = { INR: 1 };
    for (const code of ["USD", "GBP", "EUR", "AED"] as const) {
      const value = payload.rates?.[code];
      if (typeof value === "number" && Number.isFinite(value) && value > 0) rates[code] = value;
    }
    return rates;
  } catch {
    // Never substitute invented rates. INR remains the safe display fallback.
    return { INR: 1 };
  }
}

export const getExchangeRates = unstable_cache(loadRates, ["socialrush-fx-rates-v1"], { revalidate: 21600 });
