import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/admin/require-admin-api";

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

  const update: Record<string, string | null> = { status };
  if (body?.note !== undefined) update.admin_note = String(body.note).trim().slice(0, 2000) || null;
  const { data, error } = await auth.supabase.from("orders").update(update).eq("id", params.id).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${params.id}`);
  revalidatePath("/dashboard/orders");
  return NextResponse.json({ data });
}
