import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapProviderStatus, providerClient } from "@/lib/provider/client";

export async function POST(request: NextRequest) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const body = await request.json().catch(() => null) as { orderId?: string; providerStatus?: string } | null;
  if (!body?.orderId) return NextResponse.json({ error: "Local order ID is required" }, { status: 422 });
  const { data: order } = await supabase.from("orders").select("id, provider_order_id, status").eq("id", body.orderId).single();
  if (!order?.provider_order_id) return NextResponse.json({ error: "Provider order ID is not set" }, { status: 422 });
  const prepared = providerClient.prepareStatusCheck(order.provider_order_id);
  if (body.providerStatus) { const status = mapProviderStatus(body.providerStatus); await supabase.from("orders").update({ status }).eq("id", order.id); return NextResponse.json({ data: { updated: true, status, request: prepared } }); }
  return NextResponse.json({ data: { mode: "preparation-only", sent: false, localStatus: order.status, request: prepared }, message: "Provider status calls are intentionally disabled. Supply providerStatus to test local synchronization." });
}
