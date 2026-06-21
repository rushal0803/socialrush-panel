import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 50, 100);
  const { data, error } = await supabase
    .from("orders")
    .select("id, link, package_name, charge, status, provider_order_id, created_at, services(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as { serviceId?: number; link?: string; package?: string } | null;
  if (!body?.serviceId || !body.link || !body.package) {
    return NextResponse.json({ error: "serviceId, link, and package are required" }, { status: 422 });
  }

  const { data, error } = await supabase.rpc("place_campaign", {
    p_service_id: body.serviceId,
    p_link: body.link,
    p_package: body.package,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data: { id: data } }, { status: 201 });
}
