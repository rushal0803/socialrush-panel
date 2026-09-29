export type PaymentConfidenceInput = {
  id: string;
  type: string;
  status: string;
  payment_method: string | null;
  amount: number;
  created_at: string;
};

export type PaymentRecovery = {
  id: string;
  tone: "warning" | "danger" | "info";
  title: string;
  detail: string;
  actionLabel: string;
  actionHref: string;
};

const completed = new Set(["paid", "completed", "success", "successful", "succeeded"]);
const pending = new Set(["pending", "processing", "created"]);
const failed = new Set(["failed", "cancelled", "canceled"]);

export function paymentState(status: string) {
  const value = status.toLowerCase();
  if (completed.has(value)) return "completed" as const;
  if (pending.has(value)) return "pending" as const;
  if (failed.has(value)) return "failed" as const;
  if (value === "refunded" || value === "refund") return "refunded" as const;
  return "other" as const;
}

export function buildPaymentRecovery(
  item: PaymentConfidenceInput,
  now = Date.now(),
): PaymentRecovery | null {
  const state = paymentState(item.status);
  const created = new Date(item.created_at).getTime();
  const ageHours = Number.isFinite(created) ? Math.max(0, (now - created) / 3_600_000) : 0;
  const method = (item.payment_method || "payment").replaceAll("_", " ");

  if (state === "pending") {
    if (ageHours >= 24) {
      return {
        id: item.id,
        tone: "warning",
        title: "Payment verification needs attention",
        detail: `This ${method} payment has been pending for more than 24 hours. Do not pay again. Share the payment reference with support so it can be checked.`,
        actionLabel: "Open support",
        actionHref: "/dashboard/support",
      };
    }
    return {
      id: item.id,
      tone: "info",
      title: "Payment is still being verified",
      detail: `This ${method} payment is pending. Your wallet has not been credited yet. Do not submit the same payment again while verification is in progress.`,
      actionLabel: "View billing record",
      actionHref: `/dashboard/billing/transactions/${encodeURIComponent(item.id)}`,
    };
  }

  if (state === "failed") {
    return {
      id: item.id,
      tone: "danger",
      title: "Payment was not completed",
      detail: "No completed wallet credit should be expected from this record. Review the payment details before starting a new funding attempt.",
      actionLabel: "Try Add Funds again",
      actionHref: "/dashboard/add-funds",
    };
  }

  if (state === "refunded") {
    return {
      id: item.id,
      tone: "info",
      title: "Refund recorded",
      detail: "A refund record exists for this transaction. Open the receipt to review the reference and amount.",
      actionLabel: "View refund record",
      actionHref: `/dashboard/billing/transactions/${encodeURIComponent(item.id)}`,
    };
  }

  return null;
}

export function paymentConfidenceSummary(items: PaymentConfidenceInput[]) {
  const counts = { completed: 0, pending: 0, failed: 0, refunded: 0, other: 0 };
  for (const item of items) counts[paymentState(item.status)] += 1;
  return counts;
}
