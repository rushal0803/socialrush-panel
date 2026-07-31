import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { razorpayConfig, verifyHmac } from "@/lib/payments/razorpay";
import { recordTrustedEvent } from "@/lib/analytics/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string } | null;
  if (!body?.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) return NextResponse.json({ error: "Incomplete payment verification data" }, { status: 422 });
  try {
    const { keySecret } = razorpayConfig();
    if (!verifyHmac(`${body.razorpay_order_id}|${body.razorpay_payment_id}`, body.razorpay_signature, keySecret)) return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 });
    const { data: balance, error } = await supabase.rpc("credit_verified_payment", { p_provider_order_id: body.razorpay_order_id, p_provider_payment_id: body.razorpay_payment_id });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await recordTrustedEvent({eventName:"payment_successful",customerId:user.id,pagePath:"/dashboard/add-funds",metadata:{method:"razorpay"}});
    await recordTrustedEvent({eventName:"wallet_credited",customerId:user.id,pagePath:"/dashboard/wallet",metadata:{method:"razorpay"}});
    return NextResponse.json({ data: { balance, paymentId: body.razorpay_payment_id } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to verify payment" }, { status: 503 });
  }
}
