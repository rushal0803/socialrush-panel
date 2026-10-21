export type RefundRequest = {
  id: string; provider_payment_id: string; amount: number | string;
  provider_refund_id: string | null;
  status: "reserved" | "submitting" | "pending" | "manual_review" | "completed" | "failed";
};
export type GatewayRefund = {
  id: string; payment_id: string; amount: number; currency: string;
  status: string; receipt?: string | null; notes?: { refund_request_id?: string };
};
export type RefundDependencies = {
  claim(id: string): Promise<boolean>;
  record(id: string, status: RefundRequest["status"], providerId: string | null, reason: string | null): Promise<RefundRequest>;
  payment(id: string): Promise<{ id: string; amount: number; currency: string; status: string; amount_refunded: number }>;
  create(paymentId: string, amount: number, requestId: string): Promise<GatewayRefund>;
  fetchRefund(id: string): Promise<GatewayRefund>;
  list(paymentId: string, skip: number): Promise<GatewayRefund[]>;
};

/** At most one POST per durable request. An uncertain POST is reconciled, never resent. */
export async function processGatewayRefund(request: RefundRequest, deps: RefundDependencies): Promise<RefundRequest> {
  if (["completed", "failed"].includes(request.status)) return request;
  const amount = Math.round(Number(request.amount) * 100);
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Invalid reserved refund amount");
  const review = (reason: string) => deps.record(request.id, "manual_review", request.provider_refund_id, reason);
  const accept = async (refund: GatewayRefund) => {
    if (!refund.id || refund.payment_id !== request.provider_payment_id || refund.amount !== amount || refund.currency !== "INR" ||
      (refund.receipt !== request.id && refund.notes?.refund_request_id !== request.id) ||
      (request.provider_refund_id && refund.id !== request.provider_refund_id)) return review("Provider refund identity/amount mismatch");
    const status = refund.status === "processed" ? "completed" : refund.status === "failed" ? "failed" : refund.status === "pending" ? "pending" : "manual_review";
    // Retain the verified provider reference even if the later ledger settlement fails.
    if (status === "completed" && !request.provider_refund_id) await deps.record(request.id, "pending", refund.id, "Provider confirmed; local settlement pending");
    return deps.record(request.id, status, refund.id, status === "manual_review" ? "Unknown provider refund status" : null);
  };

  // Commit the claim BEFORE contacting the provider. A lost claim response cannot cause a POST.
  const claimed = await deps.claim(request.id);
  if (claimed) {
    try {
      const payment = await deps.payment(request.provider_payment_id);
      if (payment.id !== request.provider_payment_id || payment.status !== "captured" || payment.currency !== "INR" ||
          payment.amount !== amount || payment.amount_refunded !== 0) return review("Payment not an untouched captured INR deposit; reconcile manually");
      return await accept(await deps.create(request.provider_payment_id, amount, request.id));
    } catch {
      // Includes timeouts AND local persistence failures after a successful provider response.
      // The committed submitting state remains the recovery anchor if this write also fails.
      return review("Provider outcome uncertain; reconcile before any further action");
    }
  }

  try {
    if (request.provider_refund_id) return await accept(await deps.fetchRefund(request.provider_refund_id));
    const matches: GatewayRefund[] = [];
    let complete = false;
    for (let skip = 0; skip < 1000; skip += 100) {
      const batch = await deps.list(request.provider_payment_id, skip);
      matches.push(...batch.filter(r => r.receipt === request.id || r.notes?.refund_request_id === request.id));
      if (batch.length < 100) { complete = true; break; }
    }
    if (!complete || matches.length !== 1) return review(matches.length > 1 ? "Multiple matching refunds; manual reconciliation required" : "No unique confirmed refund; do not reissue automatically");
    return await accept(matches[0]);
  } catch {
    return review("Provider reconciliation unavailable; reserved funds require manual review");
  }
}
