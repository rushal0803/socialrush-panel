import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { refundOrderToWalletOnce } from "@/lib/admin/refund-order";

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
    .select("id,user_id,charge,status")
    .eq("id", params.id)
    .maybeSingle();
  if (currentOrderError) return NextResponse.json({ error: currentOrderError.message }, { status: 400 });
  if (!currentOrder) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const update: Record<string, string | null> = { status };
  if (body?.note !== undefined) update.admin_note = String(body.note).trim().slice(0, 2000) || null;
  const { data, error } = await auth.supabase.from("orders").update(update).eq("id", params.id).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  let refund: Awaited<ReturnType<typeof refundOrderToWalletOnce>> | null = null;
  if (
    (status === "cancelled" || status === "refunded") &&
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
  revalidatePath("/dashboard/wallet");
  return NextResponse.json({ data, refund });
}
