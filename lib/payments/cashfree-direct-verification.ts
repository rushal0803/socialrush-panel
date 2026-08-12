import "server-only";
import { cashfreeRequest, type CashfreeOrder, type CashfreePayment } from "@/lib/payments/cashfree";
import { classifyCashfreeDirectVerification } from "@/lib/payments/cashfree-direct-status";
import { createAdminClient } from "@/lib/supabase/admin";

type VerificationResult =
  | { kind: "not_found" }
  | { kind: "success"; orderId: string | null; balance?: number; duplicate?: boolean; checkoutIntentId: string }
  | { kind: "pending" | "failed"; checkoutIntentId: string }
  | { kind: "mismatch"; checkoutIntentId: string }
  | { kind: "finalizing"; checkoutIntentId: string };

export async function verifyCashfreeDirectCheckout(orderId: string, userId: string): Promise<VerificationResult> {
  const admin = createAdminClient();
  const { data: localPayment } = await admin.from("cashfree_checkout_intent_payments")
    .select("user_id,checkout_intent_id,required_top_up_paise,status,order_id")
    .eq("provider_order_id", orderId).maybeSingle();
  if (!localPayment || localPayment.user_id !== userId) return { kind: "not_found" };
  if (localPayment.status === "completed") {
    return { kind: "success", orderId: localPayment.order_id, duplicate: true, checkoutIntentId: localPayment.checkout_intent_id };
  }

  try {
    const [order, payments] = await Promise.all([
      cashfreeRequest<CashfreeOrder>(`/orders/${encodeURIComponent(orderId)}`),
      cashfreeRequest<CashfreePayment[]>(`/orders/${encodeURIComponent(orderId)}/payments`),
    ]);
    const payment = payments.find((item) => item.payment_status === "SUCCESS" && item.is_captured !== false);
    const verificationStatus = classifyCashfreeDirectVerification(order.order_status, payments);
    if (verificationStatus !== "success") {
      if (verificationStatus !== "pending") {
        await admin.from("cashfree_checkout_intent_payments")
          .update({ status: verificationStatus, updated_at: new Date().toISOString() })
          .eq("provider_order_id", orderId).eq("status", "pending");
      }
      return { kind: verificationStatus === "pending" ? "pending" : "failed", checkoutIntentId: localPayment.checkout_intent_id };
    }

    const expected = Number(localPayment.required_top_up_paise) / 100;
    if (!payment || order.order_id !== orderId || order.order_currency !== "INR" || Number(order.order_amount) !== expected || payment.order_id !== orderId || payment.payment_currency !== "INR" || payment.order_currency !== "INR" || Number(payment.order_amount) !== expected || Number(payment.payment_amount) !== expected) {
      return { kind: "mismatch", checkoutIntentId: localPayment.checkout_intent_id };
    }
    const { data, error } = await admin.rpc("settle_cashfree_checkout_intent_payment_system", {
      p_provider_order_id: orderId,
      p_provider_payment_id: payment.cf_payment_id,
    });
    if (error) return { kind: "finalizing", checkoutIntentId: localPayment.checkout_intent_id };
    return { kind: "success", checkoutIntentId: localPayment.checkout_intent_id, ...(data as { orderId: string; balance?: number }) };
  } catch {
    return { kind: "pending", checkoutIntentId: localPayment.checkout_intent_id };
  }
}
