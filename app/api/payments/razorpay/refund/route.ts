import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { razorpayRequest } from "@/lib/payments/razorpay";
import { processGatewayRefund, type GatewayRefund, type RefundDependencies, type RefundRequest } from "@/lib/payments/gateway-refund";
import { isUuid, rateLimit, requireJson, requireSameOrigin } from "@/lib/security/request";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;
  const originError = requireSameOrigin(request); if (originError) return originError;
  const jsonError = requireJson(request); if (jsonError) return jsonError;
  const limited = rateLimit(request, "gateway-refund", 10, 60_000, auth.user.id); if (limited) return limited;
  // Roll out only after migration + reconciliation tests. No unsafe legacy fallback.
  if (process.env.GATEWAY_REFUNDS_ENABLED !== "true") return NextResponse.json({ error: "Gateway refunds require rollout approval. No refund was submitted." }, { status: 503 });
  const body = await request.json().catch(() => null) as { transactionId?: string } | null;
  if (!isUuid(body?.transactionId)) return NextResponse.json({ error: "A valid transaction ID is required" }, { status: 422 });
  const db = auth.supabase;
  const record: RefundDependencies["record"] = async (id, status, providerId, reason) => {
    const { data, error } = await db.rpc("record_wallet_gateway_refund", {
      p_request_id: id, p_status: status, p_provider_refund_id: providerId, p_reason: reason,
    });
    if (error) throw new Error("Refund persistence unavailable");
    return data as RefundRequest;
  };
  try {
    const { data, error } = await db.rpc("request_wallet_gateway_refund", { p_transaction_id: body!.transactionId });
    if (error) return NextResponse.json({ error: "Deposit is not eligible, balance is insufficient, or refund storage is unavailable. No new provider request was sent." }, { status: 409 });
    const result = await processGatewayRefund(data as RefundRequest, {
      record,
      claim: async id => {
        const { data: claimed, error: claimError } = await db.rpc("claim_wallet_gateway_refund", { p_request_id: id });
        if (claimError) throw new Error("Refund claim unavailable");
        return claimed === true;
      },
      payment: id => razorpayRequest(`/payments/${encodeURIComponent(id)}`, { signal: AbortSignal.timeout(10_000) }),
      create: (id, amount, requestId) => razorpayRequest<GatewayRefund>(`/payments/${encodeURIComponent(id)}/refund`, {
        method: "POST", signal: AbortSignal.timeout(15_000),
        body: JSON.stringify({ amount, receipt: requestId, notes: { refund_request_id: requestId } }),
      }),
      fetchRefund: id => razorpayRequest<GatewayRefund>(`/refunds/${encodeURIComponent(id)}`, { signal: AbortSignal.timeout(10_000) }),
      list: async (id, skip) => (await razorpayRequest<{ items: GatewayRefund[] }>(`/payments/${encodeURIComponent(id)}/refunds?count=100&skip=${skip}`, { signal: AbortSignal.timeout(10_000) })).items,
    });
    return NextResponse.json({ data: { requestId: result.id, status: result.status, refundId: result.provider_refund_id,
      manualReviewRequired: result.status === "manual_review" } }, {
      status: ["completed", "failed"].includes(result.status) ? 200 : 202, headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Refund outcome requires reconciliation. Do not submit another payment or issue a refund outside this request." }, { status: 503 });
  }
}
