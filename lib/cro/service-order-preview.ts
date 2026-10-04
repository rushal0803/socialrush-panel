import { validateQuantity, type QuantityRules } from "../service-pricing.ts";

/** Mirrors the existing dashboard's paise rounding using the supplied rate. */
export function previewOrderTotal(rate: number, quantity: number, rules: QuantityRules): number | null {
  if (!Number.isFinite(rate) || rate <= 0 || validateQuantity(quantity, rules)) return null;
  const paise = Math.round(quantity * rate * 100 / 1000);
  return Number.isSafeInteger(paise) ? paise / 100 : null;
}

export function previewQuantities(rules: QuantityRules): number[] {
  return [...new Set([rules.minQuantity, 500, 1000, 2500, 5000, 10000])]
    .filter(value => !validateQuantity(value, rules)).slice(0, 6);
}
