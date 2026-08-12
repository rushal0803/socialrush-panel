export type CashfreeDirectPaymentAttempt = {
  cf_payment_id?: string | null;
  payment_status?: string | null;
  is_captured?: boolean | null;
  payment_time?: string | null;
  payment_completion_time?: string | null;
};

export type CashfreeDirectVerificationStatus = "success" | "pending" | "failed" | "cancelled" | "expired";

const terminalPaymentStatuses = new Set(["FAILED", "CANCELLED", "USER_DROPPED", "EXPIRED", "TERMINATED"]);
const pendingPaymentStatuses = new Set(["PENDING", "ACTIVE", "INITIATED", "NOT_ATTEMPTED"]);

function normalized(value: string | null | undefined) {
  return String(value || "").toUpperCase();
}

function attemptTimestamp(payment: CashfreeDirectPaymentAttempt) {
  const timestamps = [payment.payment_time, payment.payment_completion_time]
    .map((value) => Date.parse(value || ""))
    .filter(Number.isFinite);
  return timestamps.length ? Math.max(...timestamps) : null;
}

export function latestCashfreeDirectPaymentAttempt(payments: CashfreeDirectPaymentAttempt[]) {
  return payments.reduce<{ payment: CashfreeDirectPaymentAttempt; timestamp: number | null; index: number } | null>((latest, payment, index) => {
    const timestamp = attemptTimestamp(payment);
    if (!latest || timestamp !== null && (latest.timestamp === null || timestamp >= latest.timestamp)) {
      return { payment, timestamp, index };
    }
    // When Cashfree has not supplied timestamps yet, retain the later API item
    // as the fallback while preferring any item with a real timestamp.
    if (timestamp === null && latest.timestamp === null && index > latest.index) {
      return { payment, timestamp, index };
    }
    return latest;
  }, null);
}

export function classifyCashfreeDirectVerification(
  orderStatus: string | null | undefined,
  payments: CashfreeDirectPaymentAttempt[],
): CashfreeDirectVerificationStatus {
  const providerOrderStatus = normalized(orderStatus);
  const hasCapturedSuccess = payments.some((payment) => normalized(payment.payment_status) === "SUCCESS" && payment.is_captured !== false);

  if (providerOrderStatus === "PAID" && hasCapturedSuccess) return "success";
  if (providerOrderStatus === "EXPIRED") return "expired";
  if (providerOrderStatus === "TERMINATED" || providerOrderStatus === "CANCELLED") return "cancelled";
  if (providerOrderStatus !== "ACTIVE") return "failed";

  const latestAttempt = latestCashfreeDirectPaymentAttempt(payments);
  const latestStatus = normalized(latestAttempt?.payment.payment_status);

  // Cashfree returns every attempt for an order. Only the newest attempt may
  // keep checkout processable; an older NOT_ATTEMPTED/PENDING entry must not
  // hide a newer terminal failure.
  if (pendingPaymentStatuses.has(latestStatus) || latestStatus === "SUCCESS") return "pending";
  if (terminalPaymentStatuses.has(latestStatus) || latestStatus === "VOID") {
    return latestStatus === "CANCELLED" || latestStatus === "USER_DROPPED" || latestStatus === "VOID" ? "cancelled" : "failed";
  }
  if (latestStatus) return "failed";

  // Cashfree can briefly return no payment attempts while checkout is opening.
  return "pending";
}
