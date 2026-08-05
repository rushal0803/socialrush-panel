import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isUuid, requireJson, requireSameOrigin, rateLimit } from "@/lib/security/request";
import { recordTrustedEvent } from "@/lib/analytics/server";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to request a refill." }, { status: 401 });
  if (!isUuid(params.id)) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  const originError = requireSameOrigin(request); if (originError) return originError;
  const jsonError = requireJson(request, 2_048); if (jsonError) return jsonError;
  const limited = rateLimit(request, "refill", 6, 60 * 60_000, user.id); if (limited) return limited;
  const body = await request.json().catch(() => null) as { note?: unknown } | null;
  const note = typeof body?.note === "string" ? body.note.trim() : "";
  if (/<\/?[a-z][\s\S]*>/i.test(note)) return NextResponse.json({ error: "Your note cannot contain HTML." }, { status: 422 });
  if (note.length > 500) return NextResponse.json({ error: "Your note must be 500 characters or fewer." }, { status: 422 });
  const { data, error } = await supabase.rpc("request_order_refill", { p_order_id: params.id, p_customer_note: note || null });
  if (error) {
    const duplicate = /active refill|already/i.test(error.message);
    return NextResponse.json({ error: duplicate ? "A refill request is already being reviewed for this order." : "This refill request could not be submitted. Please contact support if the issue continues." }, { status: duplicate ? 409 : 400 });
  }
  await recordTrustedEvent({ eventName: "refill_requested", customerId: user.id, pagePath: "/dashboard/orders", eventId: `refill:${data}`, metadata: { order_id: params.id } });
  return NextResponse.json({ data }, { status: 201 });
}
