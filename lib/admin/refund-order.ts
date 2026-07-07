import type { SupabaseClient } from "@supabase/supabase-js";

type RefundableOrder = {
  id: string;
  user_id: string;
  charge: number | string | null;
  status?: string | null;
};

export async function refundOrderToWalletOnce(
  supabase: SupabaseClient,
  order: RefundableOrder,
  reason = "Refund for cancelled order",
) {
  const amount = Math.round(Number(order.charge ?? 0) * 100) / 100;
  if (!order.user_id || !Number.isFinite(amount) || amount <= 0) {
    return { refunded: false, amount: 0, reason: "No refundable order amount" };
  }

  const { data: existingRefund, error: existingError } = await supabase
    .from("transactions")
    .select("id,amount,created_at")
    .eq("user_id", order.user_id)
    .eq("type", "refund")
    .contains("metadata", { order_id: order.id, refund_kind: "order_cancelled" })
    .maybeSingle();

  if (existingError) throw existingError;
  if (existingRefund) {
    return { refunded: false, alreadyRefunded: true, amount: Number(existingRefund.amount ?? amount) };
  }

  const { data: legacyRefund, error: legacyError } = await supabase
    .from("transactions")
    .select("id,amount,created_at")
    .eq("user_id", order.user_id)
    .eq("type", "refund")
    .ilike("description", `%${order.id}%`)
    .maybeSingle();

  if (legacyError) throw legacyError;
  if (legacyRefund) {
    return { refunded: false, alreadyRefunded: true, amount: Number(legacyRefund.amount ?? amount) };
  }

  const { error: balanceError } = await supabase.rpc("admin_adjust_balance", {
    p_user_id: order.user_id,
    p_amount: amount,
    p_operation: "add",
  });
  if (balanceError) throw balanceError;

  const { error: transactionError } = await supabase.from("transactions").insert({
    user_id: order.user_id,
    amount,
    type: "refund",
    status: "completed",
    payment_method: "wallet",
    description: `${reason} ${order.id}`,
    metadata: {
      order_id: order.id,
      refund_kind: "order_cancelled",
      refunded_at: new Date().toISOString(),
    },
  });
  if (transactionError) throw transactionError;

  return { refunded: true, amount };
}
