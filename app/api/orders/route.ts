import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 50, 100);
  const { data, error } = await supabase
    .from("orders")
    .select("id, service_name, platform, unit_price, link, quantity, package_name, charge, status, provider_order_id, created_at, services(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as { serviceId?: number; serviceCode?: string; link?: string; quantity?: number; requestId?: string } | null;
  if (!body?.serviceId || !body.serviceCode || !body.link || !Number.isInteger(body.quantity) || !body.requestId) {
    return NextResponse.json({ error: "Complete service, link, quantity, and checkout request details are required" }, { status: 422 });
  }

  const { data, error } = await supabase.rpc("checkout_campaign_with_wallet", {
    p_service_id: body.serviceId,
    p_service_code: body.serviceCode,
    p_link: body.link,
    p_quantity: body.quantity,
    p_request_id: body.requestId,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/wallet");
  return NextResponse.json({ data }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
