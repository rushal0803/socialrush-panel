import { NextResponse, type NextRequest } from "next/server";
import { cashfreeRequest, type CashfreeOrder, type CashfreePayment } from "@/lib/payments/cashfree";
import { classifyCashfreeDirectVerification, latestCashfreeDirectPaymentAttempt } from "@/lib/payments/cashfree-direct-status";
import { requireJson, requireSameOrigin, rateLimit } from "@/lib/security/request";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const originError=requireSameOrigin(request); if(originError)return originError; const jsonError=requireJson(request); if(jsonError)return jsonError;
  const limited=rateLimit(request,"cashfree-direct-verify",15,60_000,user.id); if(limited)return limited;
  const body=await request.json().catch(()=>null) as {orderId?:string}|null; const orderId=body?.orderId;
  if(!orderId||!/^src_[a-f0-9]{32}$/.test(orderId)) return NextResponse.json({error:"Invalid payment reference."},{status:422});
  const admin=createAdminClient(); const {data:pending}=await admin.from("cashfree_checkout_intent_payments").select("user_id,required_top_up_paise,status,order_id,provider_payment_id").eq("provider_order_id",orderId).maybeSingle();
  if(!pending||pending.user_id!==user.id)return NextResponse.json({error:"Checkout payment not found."},{status:404});
  if(pending.status==="completed")return NextResponse.json({data:{status:"success",orderId:pending.order_id,duplicate:true}});
  try { const [order,payments]=await Promise.all([cashfreeRequest<CashfreeOrder>(`/orders/${encodeURIComponent(orderId)}`),cashfreeRequest<CashfreePayment[]>(`/orders/${encodeURIComponent(orderId)}/payments`)]); const payment=payments.find(item=>item.payment_status==="SUCCESS"&&item.is_captured!==false);
    const verificationStatus=classifyCashfreeDirectVerification(order.order_status,payments);
    if (process.env.CASHFREE_ENV === "sandbox") {
      const selected = latestCashfreeDirectPaymentAttempt(payments);
      console.info("[CASHFREE_PREVIEW_DIAG] " + JSON.stringify({
        providerOrderStatus: order.order_status,
        paymentAttemptCount: payments.length,
      }));
      for (const [index, attempt] of payments.entries()) {
        console.info("[CASHFREE_PREVIEW_DIAG] " + JSON.stringify({
          attemptIndex: index,
          payment_status: attempt.payment_status,
          is_captured: attempt.is_captured,
          payment_time: attempt.payment_time,
          payment_completion_time: attempt.payment_completion_time,
          cf_payment_id: attempt.cf_payment_id,
        }));
      }
      console.info("[CASHFREE_PREVIEW_DIAG] " + JSON.stringify({
        selectedAttemptIndex: selected?.index ?? null,
        selectedAttempt: selected ? {
          payment_status: selected.payment.payment_status,
          is_captured: selected.payment.is_captured,
          payment_time: selected.payment.payment_time,
          payment_completion_time: selected.payment.payment_completion_time,
          cf_payment_id: selected.payment.cf_payment_id,
        } : null,
        verificationStatus,
      }));
    }
    if(verificationStatus!=="success") {
      if(verificationStatus!=="pending") await admin.from("cashfree_checkout_intent_payments").update({status:verificationStatus,updated_at:new Date().toISOString()}).eq("provider_order_id",orderId).eq("status","pending");
      return NextResponse.json({data:{status:verificationStatus==="pending"?"pending":"failed"}});
    }
    const expected=Number(pending.required_top_up_paise)/100;
    if(order.order_id!==orderId||order.order_currency!=="INR"||Number(order.order_amount)!==expected||payment.order_id!==orderId||payment.payment_currency!=="INR"||payment.order_currency!=="INR"||Number(payment.order_amount)!==expected||Number(payment.payment_amount)!==expected)return NextResponse.json({error:"Payment details did not match the checkout."},{status:409});
    const {data,error}=await admin.rpc("settle_cashfree_checkout_intent_payment_system",{p_provider_order_id:orderId,p_provider_payment_id:payment.cf_payment_id}); if(error)return NextResponse.json({error:"Payment is verified and is being finalized. Please check Orders shortly."},{status:409});
    return NextResponse.json({data:{status:"success",...(data as object)}});
  } catch { return NextResponse.json({data:{status:"pending"}}); }
}
