/** Shared server pricing policy. Discounts apply to the current selling rate,
 * never to a provider cost. Review margins before increasing these caps. */
export const PACKAGE_DISCOUNTS = [
  { id: "starter", label: "Starter", bestFor: "Start with a smaller campaign", discountPercent: 0 },
  { id: "growth", label: "Growth", bestFor: "For growing accounts", discountPercent: 3 },
  { id: "pro", label: "Pro", bestFor: "Build a larger campaign", discountPercent: 5 },
  { id: "scale", label: "Scale", bestFor: "For high-volume campaigns", discountPercent: 8 },
] as const;
