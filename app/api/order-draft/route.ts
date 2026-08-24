import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireJson, requireSameOrigin } from "@/lib/security/request";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("order_drafts").select("platform,service_code,quantity,target,updated_at").eq("user_id", user.id).maybeSingle();
  if (error) return NextResponse.json({ error: "Unable to load your draft." }, { status: 400 });
  return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: NextRequest) {
  const originError = requireSameOrigin(request); if (originError) return originError;
  const jsonError = requireJson(request); if (jsonError) return jsonError;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const platform = typeof body?.platform === "string" ? body.platform.trim().toLowerCase() : "";
  const serviceCode = typeof body?.serviceCode === "string" ? body.serviceCode.trim().toLowerCase() : "";
  const target = typeof body?.target === "string" ? body.target.trim() || null : null;
  const quantity = Number(body?.quantity);
  if (!platform || !serviceCode || !Number.isInteger(quantity) || quantity < 1 || platform.length > 40 || serviceCode.length > 100 || (target && target.length > 2048)) return NextResponse.json({ error: "Draft details are invalid." }, { status: 422 });
  const { error } = await supabase.from("order_drafts").upsert({ user_id: user.id, platform, service_code: serviceCode, quantity, target, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) return NextResponse.json({ error: "Unable to save your draft." }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const originError = requireSameOrigin(request); if (originError) return originError;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { error } = await supabase.from("order_drafts").delete().eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "Unable to discard your draft." }, { status: 400 });
  return new NextResponse(null, { status: 204 });
}
