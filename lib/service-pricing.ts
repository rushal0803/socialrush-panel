export const SERVICE_PRICES = {
  "instagram-followers": 599,
  "instagram-likes": 249,
  "instagram-views": 30,
  "instagram-comments": 499,
  // A client-side fallback only. Checkout reads the active Supabase row for
  // this service so its live rate remains authoritative.
  "instagram-saves": 199,
  "youtube-subscribers": 3999,
  "youtube-likes": 499,
  "youtube-views": 249,
  "facebook-followers": 299,
  "facebook-likes": 149,
  "facebook-views": 99,
  "facebook-shares": 499,
  "linkedin-followers": 2999,
  "linkedin-likes": 2499,
  "telegram-members": 799,
  "tiktok-followers": 499,
  "tiktok-likes": 150,
  "tiktok-views": 15,
  "x-followers": 799,
} as const;

export type ServiceCode = keyof typeof SERVICE_PRICES;

export const CATALOG_CURRENCY = "INR" as const;

/** Prices are held as paise while calculating; display values are derived only at the edge. */
export const SERVICE_PRICES_PAISE: Readonly<Record<ServiceCode, number>> = Object.fromEntries(
  Object.entries(SERVICE_PRICES).map(([code, rupees]) => [code, rupees * 100]),
) as Record<ServiceCode, number>;

export function getPricePer1000(serviceCode: ServiceCode) {
  return SERVICE_PRICES[serviceCode];
}

export function calculateServiceTotal(serviceCode: ServiceCode, quantity: number) {
  return calculateServiceTotalPaise(serviceCode, quantity) / 100;
}

export function calculateServiceTotalPaise(serviceCode: ServiceCode, quantity: number) {
  if (!Number.isSafeInteger(quantity) || quantity <= 0) return 0;
  // Rates are per 1,000 units. Round a fractional paise once, at the boundary.
  return Math.round((quantity * SERVICE_PRICES_PAISE[serviceCode]) / 1000);
}

export type QuantityRules = Readonly<{ minQuantity: number; maxQuantity: number; quantityStep?: number }>;

export function validateQuantity(quantity: unknown, rules: QuantityRules): string | null {
  if (!Number.isSafeInteger(quantity) || (quantity as number) <= 0) return "Enter a valid whole-number quantity.";
  const requestedQuantity = quantity as number;
  if (requestedQuantity < rules.minQuantity || requestedQuantity > rules.maxQuantity) {
    return `Quantity must be between ${rules.minQuantity.toLocaleString("en-IN")} and ${rules.maxQuantity.toLocaleString("en-IN")}.`;
  }
  const step = rules.quantityStep ?? 1;
  if (!Number.isSafeInteger(step) || step <= 0 || ((requestedQuantity - rules.minQuantity) % step) !== 0) {
    return `Quantity must increase in steps of ${step.toLocaleString("en-IN")}.`;
  }
  return null;
}

export function formatMoney(paise: number, currency: typeof CATALOG_CURRENCY = CATALOG_CURRENCY) {
  if (!Number.isSafeInteger(paise) || paise < 0) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(paise / 100);
}
