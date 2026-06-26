export const currencyCodes = ["INR", "USD", "EUR", "GBP", "AED", "CAD", "AUD", "SGD"] as const;
export type Currency = (typeof currencyCodes)[number];

type CurrencyRates = Record<Currency, number>;

const EXCHANGE_STORAGE_KEY = "socialrush.currency.rates.v1";
const EXCHANGE_EVENT = "socialrush-currency-rates-updated";
const EXCHANGE_API_URL = "https://open.er-api.com/v6/latest/INR";
const EXCHANGE_REFRESH_MS = 30 * 60 * 1000;

const fallbackRates: CurrencyRates = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  AED: 0.044,
  CAD: 0.016,
  AUD: 0.018,
  SGD: 0.016,
};

type CurrencyRatePayload = {
  rates: CurrencyRates;
  updatedAt: number;
  source: "api" | "fallback";
};

const currencyFormatMeta: Record<Currency, { locale: string; symbol: string; name: string }> = {
  INR: { locale: "en-IN", symbol: "₹", name: "Indian Rupee" },
  USD: { locale: "en-US", symbol: "$", name: "US Dollar" },
  EUR: { locale: "de-DE", symbol: "€", name: "Euro" },
  GBP: { locale: "en-GB", symbol: "£", name: "British Pound" },
  AED: { locale: "ar-AE", symbol: "د.إ", name: "UAE Dirham" },
  CAD: { locale: "en-CA", symbol: "C$", name: "Canadian Dollar" },
  AUD: { locale: "en-AU", symbol: "A$", name: "Australian Dollar" },
  SGD: { locale: "en-SG", symbol: "S$", name: "Singapore Dollar" },
};

export const currencies: { code: Currency; symbol: string; name: string }[] = currencyCodes.map((code) => ({
  code,
  symbol: currencyFormatMeta[code].symbol,
  name: currencyFormatMeta[code].name,
}));

let runtimeRates: CurrencyRatePayload = {
  rates: fallbackRates,
  updatedAt: Date.now(),
  source: "fallback",
};

let refreshPromise: Promise<CurrencyRatePayload> | null = null;

function mergeRates(input: Record<string, number>): CurrencyRates {
  const merged: CurrencyRates = { ...fallbackRates };
  for (const code of currencyCodes) {
    if (code === "INR") {
      merged.INR = 1;
      continue;
    }
    const rate = input[code];
    if (typeof rate === "number" && Number.isFinite(rate) && rate > 0) {
      merged[code] = rate;
    }
  }
  return merged;
}

function persistRates(payload: CurrencyRatePayload) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(EXCHANGE_STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent(EXCHANGE_EVENT, { detail: payload }));
}

function readRatesFromStorage() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(EXCHANGE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CurrencyRatePayload>;
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.rates || typeof parsed.updatedAt !== "number") return null;
    const rates = mergeRates(parsed.rates as Record<string, number>);
    const source = parsed.source === "api" ? "api" : "fallback";
    return { rates, updatedAt: parsed.updatedAt, source } satisfies CurrencyRatePayload;
  } catch {
    return null;
  }
}

export function hydrateCurrencyRatesFromStorage() {
  const stored = readRatesFromStorage();
  if (!stored) return runtimeRates;
  runtimeRates = stored;
  return runtimeRates;
}

function shouldRefreshRates() {
  return Date.now() - runtimeRates.updatedAt > EXCHANGE_REFRESH_MS;
}

export async function refreshCurrencyRates(force = false): Promise<CurrencyRatePayload> {
  if (!force && !shouldRefreshRates()) return runtimeRates;
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch(EXCHANGE_API_URL, { method: "GET", cache: "no-store" });
      if (!response.ok) throw new Error(`Failed to fetch exchange rates (${response.status})`);
      const payload = (await response.json()) as { rates?: Record<string, number> };
      if (!payload.rates) throw new Error("Rates payload missing");
      runtimeRates = {
        rates: mergeRates(payload.rates),
        updatedAt: Date.now(),
        source: "api",
      };
      persistRates(runtimeRates);
      return runtimeRates;
    } catch {
      runtimeRates = {
        rates: { ...runtimeRates.rates, ...fallbackRates, INR: 1 },
        updatedAt: Date.now(),
        source: "fallback",
      };
      persistRates(runtimeRates);
      return runtimeRates;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export function getCurrencyRates(): CurrencyRatePayload {
  return runtimeRates;
}

export function getCurrencyRatesEventName() {
  return EXCHANGE_EVENT;
}

export function convertCurrency(amountINR: number, targetCurrency: Currency): number {
  const rate = runtimeRates.rates[targetCurrency] ?? fallbackRates[targetCurrency] ?? 1;
  const converted = amountINR * rate;
  return Math.round(converted * 100) / 100;
}

export function formatCurrency(amountINR: number, targetCurrency: Currency): string {
  return formatPrice(convertCurrency(amountINR, targetCurrency), targetCurrency);
}

export function formatPrice(amount: number, currency: Currency): string {
  const meta = currencyFormatMeta[currency] ?? currencyFormatMeta.INR;
  return new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getCurrencySymbol(currency: Currency): string {
  return currencyFormatMeta[currency]?.symbol || "₹";
}

export function getCurrencyDisclaimer() {
  return "Converted from INR. Final payment may vary slightly due to exchange rates.";
}
