export type CashfreeDirectPaymentAttempt = {
  payment_status?: string | null;
  is_captured?: boolean | null;
};

export type CashfreeDirectVerificationStatus = "success" | "pending" | "failed" | "cancelled" | "expired";

const terminalPaymentStatuses = new Set(["FAILED", "CANCELLED", "USER_DROPPED", "EXPIRED", "TERMINATED"]);
const pendingPaymentStatuses = new Set(["PENDING", "ACTIVE", "INITIATED", "NOT_ATTEMPTED"]);

function normalized(value: string | null | undefined) {
  return String(value || "").toUpperCase();
}

export function classifyCashfreeDirectVerification(
  orderStatus: string | null | undefined,
  payments: CashfreeDirectPaymentAttempt[],
): CashfreeDirectVerificationStatus {
  const providerOrderStatus = normalized(orderStatus);
  const paymentStatuses = payments.map((payment) => normalized(payment.payment_status));
  const hasCapturedSuccess = payments.some((payment) => normalized(payment.payment_status) === "SUCCESS" && payment.is_captured !== false);

  if (providerOrderStatus === "PAID" && hasCapturedSuccess) return "success";
  if (providerOrderStatus === "EXPIRED") return "expired";
  if (providerOrderStatus === "TERMINATED" || providerOrderStatus === "CANCELLED") return "cancelled";
  if (providerOrderStatus !== "ACTIVE") return "failed";

  // A live payment attempt takes precedence over older failed attempts returned
  // by Cashfree. This prevents a fresh session while it remains processable.
  if (paymentStatuses.some((status) => pendingPaymentStatuses.has(status))) return "pending";
  if (paymentStatuses.some((status) => terminalPaymentStatuses.has(status))) {
    return paymentStatuses.includes("CANCELLED") || paymentStatuses.includes("USER_DROPPED") ? "cancelled" : "failed";
  }

  // Cashfree can briefly return no payment attempts while checkout is opening.
  return "pending";
}
