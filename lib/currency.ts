// Currency conversion rates (approximate, can be updated with live API)
// Base currency: INR
const conversionRates: Record<string, number> = {
  INR: 1,
  USD: 0.012, // 1 INR ≈ 0.012 USD
  EUR: 0.011, // 1 INR ≈ 0.011 EUR
  GBP: 0.0095, // 1 INR ≈ 0.0095 GBP
  AED: 0.044, // 1 INR ≈ 0.044 AED
};

export type Currency = keyof typeof conversionRates;

export const currencies: { code: Currency; symbol: string; name: string }[] = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
];

export function convertCurrency(amountINR: number, targetCurrency: Currency): number {
  if (targetCurrency === "INR") return amountINR;
  const rate = conversionRates[targetCurrency];
  return Math.round(amountINR * rate * 100) / 100; // Round to 2 decimals
}

export function formatPrice(amount: number, currency: Currency): string {
  const currencyConfig = currencies.find((c) => c.code === currency);
  const symbol = currencyConfig?.symbol || "₹";

  if (currency === "INR") {
    return `${symbol}${amount.toLocaleString("en-IN")}`;
  }

  return `${symbol}${amount.toFixed(2)}`;
}

export function getCurrencySymbol(currency: Currency): string {
  return currencies.find((c) => c.code === currency)?.symbol || "₹";
}
