export type ManualReplayOrder = { payment_status?: string | null; customer_note?: string | null };

// Replays are only idempotent for the exact same pending manual payment.
// A reused checkout request with another UTR, reference or payment method is a conflict.
export function isSameManualPayment(
  order: ManualReplayOrder,
  reference: string,
  utr: string,
  method: string,
): boolean {
  const label = method === "bank_transfer"
    ? "Bank transfer (IMPS/NEFT)"
    : method === "usdt_trc20" ? "USDT (TRC20)" : "UPI";
  return order.payment_status === "verification_pending"
    && (order.customer_note || "").startsWith(
      `${label} payment submitted for verification. Payment Ref: ${reference}. UTR: ${utr}.`,
    );
}
