import type { SupabaseClient } from "@supabase/supabase-js";

/** Status, wallet and refund ledger commit in one database transaction. */
export async function updateOrderFinancially(supabase: SupabaseClient, orderId: string,
  patch: Record<string, unknown>, expected: { status: string; payment_status: string }) {
  const { data, error } = await supabase.rpc("admin_update_order_financial", {
    p_order_id: orderId, p_patch: patch,
    p_expected_status: expected.status, p_expected_payment: expected.payment_status,
  });
  const refund = data?.__refund ?? null;
  if (data) delete data.__refund;
  return { data, error, refund };
}
