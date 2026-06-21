import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { razorpayRequest } from "@/lib/payments/razorpay";

type Refund = { id: string };

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const body = await request.json().catch(() => null) as { transactionId?: string } | null;
  if (!body?.transactionId) return NextResponse.json({ error: "Transaction ID is required" }, { status: 422 });
  const { data: transaction } = await supabase.from("transactions").select("id, user_id, provider_payment_id, amount").eq("id", body.transactionId).single();
  if (!transaction?.provider_payment_id) return NextResponse.json({ error: "Refundable payment not found" }, { status: 404 });
  const { data: wallet } = await supabase.from("profiles").select("balance").eq("id", transaction.user_id).single();
  if (Number(wallet?.balance ?? 0) < Number(transaction.amount)) return NextResponse.json({ error: "Wallet balance is below the refundable amount" }, { status: 409 });
  try {
    const refund = await razorpayRequest<Refund>(`/payments/${transaction.provider_payment_id}/refund`, { method: "POST", body: JSON.stringify({ amount: Math.round(Number(transaction.amount) * 100), notes: { transaction_id: transaction.id } }) });
    const { error } = await supabase.rpc("admin_refund_wallet_payment", { p_transaction_id: transaction.id, p_provider_refund_id: refund.id });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data: { refundId: refund.id } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Refund failed" }, { status: 503 });
  }
}
