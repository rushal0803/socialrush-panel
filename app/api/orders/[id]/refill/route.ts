import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to request a refill." }, { status: 401 });
  const body = await request.json().catch(() => null) as { note?: unknown } | null;
  const note = typeof body?.note === "string" ? body.note.trim() : "";
  if (note.length > 500) return NextResponse.json({ error: "Your note must be 500 characters or fewer." }, { status: 422 });
  const { data, error } = await supabase.rpc("request_order_refill", { p_order_id: params.id, p_customer_note: note || null });
  if (error) {
    const duplicate = /active refill|already/i.test(error.message);
    return NextResponse.json({ error: duplicate ? "A refill request is already being reviewed for this order." : "This refill request could not be submitted. Please contact support if the issue continues." }, { status: duplicate ? 409 : 400 });
  }
  return NextResponse.json({ data }, { status: 201 });
}
