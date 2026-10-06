export type FirstOrderConversionMode = "checkout_recovery" | "draft" | "first_order" | null;

export function resolveFirstOrderConversionMode({
  firstOrder,
  hasDraft,
  hasCheckoutRecovery,
}: {
  firstOrder: boolean;
  hasDraft: boolean;
  hasCheckoutRecovery: boolean;
}): FirstOrderConversionMode {
  if (hasCheckoutRecovery) return "checkout_recovery";
  if (hasDraft) return "draft";
  if (firstOrder) return "first_order";
  return null;
}
