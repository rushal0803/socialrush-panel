import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";

const statuses = new Set([
  "pending", "processing", "in_progress", "partial", "completed", "cancelled",
  "refunded", "failed", "refill_requested", "refilling",
]);

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  const params = request.nextUrl.searchParams;
  const status = params.get("status")?.trim().toLowerCase();
  const platform = params.get("platform")?.trim().toLowerCase().slice(0, 40);
  const service = params.get("service")?.trim().slice(0, 100);
  const search = params.get("q")?.trim().slice(0, 120).toLowerCase();
  const customer = params.get("customer")?.trim().slice(0, 120).toLowerCase();
  const from = params.get("from");
  const to = params.get("to");
  const limit = Math.min(Math.max(Number(params.get("limit")) || 200, 1), 500);

  let query = auth.supabase
    .from("orders")
    .select("*, profiles(full_name,email,phone), services(name,delivery_time,refill_policy)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status && statuses.has(status)) query = query.eq("status", status);
  if (platform) query = query.ilike("platform", platform);
  if (service) query = query.ilike("service_name", `%${service}%`);
  if (from && !Number.isNaN(Date.parse(from))) query = query.gte("created_at", new Date(from).toISOString());
  if (to && !Number.isNaN(Date.parse(to))) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    query = query.lte("created_at", end.toISOString());
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const filtered = (data ?? []).filter((order) => {
    const profile = order.profiles as { full_name?: string; email?: string } | null;
    const haystack = `${order.id} ${order.link} ${order.provider_order_id ?? ""} ${profile?.email ?? ""}`.toLowerCase();
    const customerText = `${profile?.full_name ?? ""} ${profile?.email ?? ""}`.toLowerCase();
    return (!search || haystack.includes(search)) && (!customer || customerText.includes(customer));
  });

  return NextResponse.json({ data: filtered }, { headers: { "Cache-Control": "no-store" } });
}

