import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";

const allowed = new Set(["reviewing", "approved", "processing", "completed", "rejected", "cancelled"]);
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;
  const body = await request.json().catch(() => null) as { status?: unknown; adminNote?: unknown } | null;
  const status = String(body?.status || "");
  if (!allowed.has(status)) return NextResponse.json({ error: "Unsupported refill status" }, { status: 422 });
  const admin_note = typeof body?.adminNote === "string" ? body.adminNote.trim().slice(0, 2000) || null : null;
  const update: Record<string, unknown> = { status, admin_note, updated_at: new Date().toISOString() };
  if (["reviewing", "approved"].includes(status)) update.reviewed_at = new Date().toISOString();
  if (status === "completed") update.completed_at = new Date().toISOString();
  const { error } = await auth.supabase.from("order_refill_requests").update(update).eq("id", params.id);
  if (error) return NextResponse.json({ error: "Unable to update refill request." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
