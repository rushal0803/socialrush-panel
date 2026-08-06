export const currencyCodes = ["INR", "USD", "EUR", "GBP", "AED", "CAD", "AUD", "SGD"] as const;
export type Currency = (typeof currencyCodes)[number];
export type CurrencyRates = Partial<Record<Currency, number>>;

export const DISPLAY_CURRENCY_COOKIE = "socialrush_display_currency";
const eurozone = new Set(["AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK"]);
const countryCurrencies: Record<string, Currency> = { IN: "INR", US: "USD", GB: "GBP", AE: "AED", CA: "CAD", AU: "AUD", SG: "SGD" };
const meta: Record<Currency, { locale: string; symbol: string; name: string }> = {
  INR: { locale: "en-IN", symbol: "₹", name: "Indian Rupee" }, USD: { locale: "en-US", symbol: "$", name: "US Dollar" },
  EUR: { locale: "de-DE", symbol: "€", name: "Euro" }, GBP: { locale: "en-GB", symbol: "£", name: "British Pound" },
  AED: { locale: "en-AE", symbol: "AED", name: "UAE Dirham" }, CAD: { locale: "en-CA", symbol: "CA$", name: "Canadian Dollar" },
  AUD: { locale: "en-AU", symbol: "A$", name: "Australian Dollar" }, SGD: { locale: "en-SG", symbol: "S$", name: "Singapore Dollar" },
};
export const currencies = currencyCodes.map((code) => ({ code, ...meta[code] }));
export const isCurrency = (value: unknown): value is Currency => typeof value === "string" && (currencyCodes as readonly string[]).includes(value);
export const getDisplayCurrencyForCountry = (country: string | null | undefined): Currency => {
  const code = country?.toUpperCase();
  return code && eurozone.has(code) ? "EUR" : (code && countryCurrencies[code]) || "INR";
};
export function getServerExchangeRates(): CurrencyRates {
  const raw = process.env.DISPLAY_CURRENCY_RATES_INR;
  if (!raw) return { INR: 1 };
  try { const parsed = JSON.parse(raw) as Record<string, unknown>; return currencyCodes.reduce<CurrencyRates>((rates, code) => {
    const value = parsed[code]; if (code === "INR") rates.INR = 1; else if (typeof value === "number" && Number.isFinite(value) && value > 0) rates[code] = value; return rates;
  }, {}); } catch { return { INR: 1 }; }
}
export function convertDisplayAmount(amountPaise: number, currency: Currency, rates: CurrencyRates): number | null {
  if (currency === "INR") return amountPaise / 100;
  const rate = rates[currency];
  return typeof rate === "number" && rate > 0 ? Math.round(amountPaise * rate) / 100 : null;
}
export function formatDisplayCurrency(amount: number, currency: Currency) { return new Intl.NumberFormat(meta[currency].locale, { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount); }
export function formatCurrency(amountINR: number, currency: Currency, rates: CurrencyRates = { INR: 1 }) { const amount = convertDisplayAmount(Math.round(amountINR * 100), currency, rates); return amount === null ? formatDisplayCurrency(amountINR, "INR") : formatDisplayCurrency(amount, currency); }
/** Compatibility helpers for non-payment presentation only. */
export function convertCurrency(amountINR: number, currency: Currency) { return convertDisplayAmount(Math.round(amountINR * 100), currency, { INR: 1 }) ?? amountINR; }
export const formatPrice = formatDisplayCurrency;
export const getCurrencySymbol = (currency: Currency) => meta[currency].symbol;
export const getCurrencyDisclaimer = () => "Displayed local prices are estimates. Checkout is processed in INR.";
