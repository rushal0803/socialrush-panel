import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { refundOrderToWalletOnce } from "@/lib/admin/refund-order";

const allowedStatuses = new Set([
  "pending", "processing", "in_progress", "partial", "completed", "cancelled",
  "refunded", "failed", "refill_requested", "refilling",
]);

const nullableText = (value: unknown, max = 2000) => {
  if (value === null || value === undefined) return null;
  const result = String(value).trim().slice(0, max);
  return result || null;
};

const nullableCount = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : undefined;
};

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  const { data: order, error } = await auth.supabase
    .from("orders")
    .select("*, profiles(full_name,email,phone), services(name,delivery_time,refill_policy)")
    .eq("id", params.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const [{ data: history }, { data: transactions }] = await Promise.all([
    auth.supabase.from("order_status_history").select("*").eq("order_id", params.id).order("created_at"),
    auth.supabase.from("transactions").select("*").contains("metadata", { order_id: params.id }).order("created_at"),
  ]);

  return NextResponse.json({ data: { order, history: history ?? [], transactions: transactions ?? [] } }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (body.status !== undefined) {
    const status = String(body.status).toLowerCase();
    if (!allowedStatuses.has(status)) return NextResponse.json({ error: "Unsupported order status" }, { status: 422 });
    update.status = status;
  }

  const { data: currentOrder, error: currentOrderError } = await auth.supabase
    .from("orders")
    .select("id,user_id,charge,status")
    .eq("id", params.id)
    .maybeSingle();
  if (currentOrderError) return NextResponse.json({ error: currentOrderError.message }, { status: 400 });
  if (!currentOrder) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  for (const key of ["starting_count", "current_count", "partial_quantity_delivered", "remaining_count"] as const) {
    if (body[key] !== undefined) {
      const count = nullableCount(body[key]);
      if (count === undefined) return NextResponse.json({ error: `${key} must be a non-negative whole number` }, { status: 422 });
      update[key] = count;
    }
  }

  if (body.delivered_count !== undefined && body.partial_quantity_delivered === undefined) {
    const count = nullableCount(body.delivered_count);
    if (count === undefined) return NextResponse.json({ error: "delivered_count must be a non-negative whole number" }, { status: 422 });
    update.partial_quantity_delivered = count;
  }

  if (body.starting_count !== undefined) {
    update.count_detection_status = "manual";
    update.count_detection_source = "admin";
    update.count_detection_message = "Starting count updated manually by an administrator.";
  }
  if (body.current_count !== undefined) update.last_count_checked_at = new Date().toISOString();
  if (body.provider_order_id !== undefined) update.provider_order_id = nullableText(body.provider_order_id, 200);
  if (body.admin_note !== undefined) update.admin_note = nullableText(body.admin_note);
  if (body.failed_reason !== undefined) update.failed_reason = nullableText(body.failed_reason);
  if (body.refund_credit_note !== undefined) update.refund_credit_note = nullableText(body.refund_credit_note);
  if (body.refill_eligible !== undefined) update.refill_eligible = Boolean(body.refill_eligible);

  if (!Object.keys(update).length) return NextResponse.json({ error: "No supported fields supplied" }, { status: 422 });

  const { data, error } = await auth.supabase.from("orders").update(update).eq("id", params.id).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  let refund: Awaited<ReturnType<typeof refundOrderToWalletOnce>> | null = null;
  if (
    (update.status === "cancelled" || update.status === "refunded") &&
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
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/order-history");
  revalidatePath("/dashboard/wallet");
  return NextResponse.json({ data, refund });
}
