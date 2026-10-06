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


export const FIRST_ORDER_NON_QUALIFYING_STATES = ["cancelled", "refunded", "failed"] as const;

export type FirstOrderState = {
  status?: string | null;
  payment_status?: string | null;
};

export type FirstOrderRewardRules = {
  enabled?: boolean | null;
  manual_approval?: boolean | null;
  minimum_order_amount?: number | string | null;
  new_customer_reward?: number | string | null;
};

const normalized = (value: unknown, fallback = "") =>
  String(value ?? fallback).trim().toLowerCase();

export function isQualifyingFirstOrderState(order: FirstOrderState) {
  const excluded = new Set<string>(FIRST_ORDER_NON_QUALIFYING_STATES);
  return (
    !excluded.has(normalized(order.status)) &&
    !excluded.has(normalized(order.payment_status, "paid"))
  );
}

export function hasPriorQualifyingOrder(orders: readonly FirstOrderState[]) {
  return orders.some(isQualifyingFirstOrderState);
}

export function buildFirstOrderContext(
  rules: FirstOrderRewardRules | null | undefined,
  orders: readonly FirstOrderState[],
) {
  const firstOrder = !hasPriorQualifyingOrder(orders);
  const reward = Number(rules?.new_customer_reward || 0);
  const minimum = Number(rules?.minimum_order_amount || 0);
  const eligible = Boolean(
    firstOrder &&
    rules?.enabled &&
    !rules.manual_approval &&
    reward > 0 &&
    minimum > 0,
  );

  return eligible
    ? { firstOrder: true, eligible: true as const, reward, minimum }
    : { firstOrder, eligible: false as const };
}
