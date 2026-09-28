export const smmPricingIndiaKeywords = [
  "social media service price list India",
  "social media growth pricing India",
  "social media service rates India",
  "social media services with UPI India",
  "INR social media pricing",
] as const;

export const smmPricingCriteria = [
  {
    id: "rate",
    title: "Rate per 1K",
    description: "Compare the current per-1,000 rate for each available service instead of relying on an old static price screenshot.",
  },
  {
    id: "quantity",
    title: "Minimum and maximum quantity",
    description: "Check the active quantity limits before planning a test order or a larger campaign.",
  },
  {
    id: "payment",
    title: "India-friendly payment options",
    description: "Review the payment methods shown in the active SocialRUSH checkout or add-funds flow, including UPI where available.",
  },
  {
    id: "support",
    title: "Delivery and refill information",
    description: "Compare the current delivery estimate and refill or support terms together with price before you order.",
  },
] as const;

export function priceForQuantity(ratePer1000: number, quantity: number) {
  if (!Number.isFinite(ratePer1000) || ratePer1000 <= 0 || !Number.isFinite(quantity) || quantity <= 0) return null;
  return Math.round((ratePer1000 * quantity) / 10) / 100;
}
