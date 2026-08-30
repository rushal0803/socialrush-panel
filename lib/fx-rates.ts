import "server-only";
import { unstable_cache } from "next/cache";
import { type CurrencyRates } from "@/lib/currency";

const providerUrl = "https://open.er-api.com/v6/latest/INR";
const supportedCurrencies = ["USD", "EUR", "GBP", "AED", "CAD", "AUD", "SGD"] as const;

async function loadRates(): Promise<CurrencyRates> {
  try {
    const response = await fetch(providerUrl, {
      next: { revalidate: 21600 },
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`FX provider returned ${response.status}`);
    const payload = await response.json() as { result?: string; base_code?: string; rates?: Record<string, unknown> };
    if (payload.result !== "success" || payload.base_code !== "INR") throw new Error("FX provider returned an invalid INR response");
    const rates: CurrencyRates = { INR: 1 };
    for (const code of supportedCurrencies) {
      const value = payload.rates?.[code];
      if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) throw new Error(`FX provider omitted ${code}`);
      rates[code] = value;
    }
    return rates;
  } catch {
    // Never substitute invented rates. INR remains the safe display fallback.
    return { INR: 1 };
  }
}

export const getExchangeRates = unstable_cache(loadRates, ["socialrush-fx-rates-v1"], { revalidate: 21600 });
