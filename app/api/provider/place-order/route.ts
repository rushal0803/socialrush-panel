import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { providerClient } from "@/lib/provider/client";

export async function POST(request: NextRequest) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const body = await request.json().catch(() => null) as { orderId?: string; providerOrderId?: string } | null;
  if (!body?.orderId) return NextResponse.json({ error: "Local order ID is required" }, { status: 422 });
  const { data: order } = await supabase.from("orders").select("id, link, quantity, service_id, services(id)").eq("id", body.orderId).single();
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const prepared = providerClient.preparePlaceOrder({ service: order.service_id, link: order.link, quantity: order.quantity });
  if (body.providerOrderId) { await supabase.from("orders").update({ provider_order_id: body.providerOrderId, status: "processing" }).eq("id", order.id); return NextResponse.json({ data: { saved: true, providerOrderId: body.providerOrderId, request: prepared } }); }
  return NextResponse.json({ data: { mode: "preparation-only", sent: false, request: prepared }, message: "Provider calls are intentionally disabled. Review the prepared request or save a provider order ID manually." });
}
