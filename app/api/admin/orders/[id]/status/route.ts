import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { refundOrderToWalletOnce } from "@/lib/admin/refund-order";
import { recordTrustedEvent } from "@/lib/analytics/server";

const statuses = new Set([
  "pending", "processing", "in_progress", "partial", "completed", "cancelled",
  "refunded", "failed", "refill_requested", "refilling",
]);

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;
  const body = (await request.json().catch(() => null)) as { status?: string; note?: string } | null;
  const status = String(body?.status ?? "").toLowerCase();
  if (!statuses.has(status)) return NextResponse.json({ error: "Unsupported order status" }, { status: 422 });

  const { data: currentOrder, error: currentOrderError } = await auth.supabase
    .from("orders")
    .select("id,user_id,charge,status,payment_status,admin_note")
    .eq("id", params.id)
    .maybeSingle();
  if (currentOrderError) return NextResponse.json({ error: currentOrderError.message }, { status: 400 });
  if (!currentOrder) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const awaitingPaymentVerification = currentOrder.payment_status === "verification_pending";
  if (awaitingPaymentVerification && !["processing", "cancelled", "failed"].includes(status)) {
    return NextResponse.json({ error: "Verify the payment before moving this order beyond Pending." }, { status: 409 });
  }

  const update: Record<string, string | null> = { status };
  if (awaitingPaymentVerification && status === "processing") {
    update.payment_status = "paid";
    const verifiedNote = `Manual payment verified by admin on ${new Date().toISOString()}.`;
    update.admin_note = body?.note !== undefined
      ? `${verifiedNote} ${String(body.note).trim().slice(0, 1800)}`.trim()
      : `${verifiedNote}${currentOrder.admin_note ? ` ${currentOrder.admin_note}` : ""}`.slice(0, 2000);
  } else if (awaitingPaymentVerification && status === "failed") {
    update.payment_status = "failed";
    const failedNote = `Manual payment verification failed by admin on ${new Date().toISOString()}.`;
    update.admin_note = body?.note !== undefined
      ? `${failedNote} ${String(body.note).trim().slice(0, 1800)}`.trim()
      : `${failedNote}${currentOrder.admin_note ? ` ${currentOrder.admin_note}` : ""}`.slice(0, 2000);
  } else if (body?.note !== undefined) {
    update.admin_note = String(body.note).trim().slice(0, 2000) || null;
  }

  const { data, error } = await auth.supabase.from("orders").update(update).eq("id", params.id).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const paymentVerified = awaitingPaymentVerification && status === "processing";
  if (paymentVerified) {
    try {
      await recordTrustedEvent({
        eventName: "payment_completed",
        customerId: currentOrder.user_id,
        pagePath: `/admin/orders/${params.id}`,
        eventId: `manual-upi-payment-completed:${params.id}`,
        metadata: {
          method: "manual_upi",
          currency: "INR",
          value: Number(currentOrder.charge),
          order_id: params.id,
          payment_status: "paid",
          source: "admin_verification",
        },
      });
    } catch (analyticsError) {
      console.error("[MANUAL_UPI_PAYMENT_COMPLETED_ANALYTICS_ERROR]", analyticsError);
    }
  }

  const paymentFailed = awaitingPaymentVerification && status === "failed";
  if (paymentFailed) {
    try {
      await recordTrustedEvent({
        eventName: "payment_failed",
        customerId: currentOrder.user_id,
        pagePath: `/admin/orders/${params.id}`,
        eventId: `manual-upi-payment-failed:${params.id}`,
        metadata: {
          method: "manual_upi",
          currency: "INR",
          value: Number(currentOrder.charge),
          order_id: params.id,
          payment_status: "failed",
          source: "admin_verification",
        },
      });
    } catch (analyticsError) {
      console.error("[MANUAL_UPI_PAYMENT_FAILED_ANALYTICS_ERROR]", analyticsError);
    }
  }

  let refund: Awaited<ReturnType<typeof refundOrderToWalletOnce>> | null = null;
  if (
    (status === "cancelled" || status === "refunded") &&
    currentOrder.payment_status === "paid" &&
    currentOrder.status !== "cancelled" &&
    currentOrder.status !== "refunded"
  ) {
    try {
      refund = await refundOrderToWalletOnce(auth.supabase, currentOrder, "Refund for cancelled order");
    } catch (refundError) {
      return NextResponse.json(
        {
          error:
            refundError instanceof Error
              ? `Order status updated, but wallet refund failed: ${refundError.message}`
              : "Order status updated, but wallet refund failed.",
        },
        { status: 500 },
      );
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${params.id}`);
  revalidatePath("/admin/analytics");
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/wallet");
  return NextResponse.json({ data, refund, paymentVerified, paymentFailed });
}
