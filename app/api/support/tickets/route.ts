import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("support_tickets").select("id, subject, category, status, order_id, created_at, updated_at, last_reply_at, orders(id,platform,service_name,status,refill_eligible,services(refill_policy))").order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { category?: string; subject?: string; message?: string; orderId?: string | null } | null;
  if (!body?.subject || !body.message) return NextResponse.json({ error: "Subject and message are required" }, { status: 422 });
  const { data, error } = await supabase.rpc("create_support_ticket", { p_category: body.category, p_subject: body.subject, p_message: body.message, p_order_id: body.orderId || null });
  if (error) return NextResponse.json({ error: error.message }, { status: error.message.includes("already have") ? 409 : 400 });
  return NextResponse.json({ data: { id: data } }, { status: 201 });
}
