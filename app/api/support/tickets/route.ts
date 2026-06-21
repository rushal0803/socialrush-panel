import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("support_tickets").select("id, subject, status, created_at").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { subject?: string; message?: string } | null;
  if (!body?.subject || !body.message) return NextResponse.json({ error: "Subject and message are required" }, { status: 422 });
  const { data: ticket, error } = await supabase.from("support_tickets").insert({ user_id: user.id, subject: body.subject }).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const { error: messageError } = await supabase.from("support_messages").insert({ ticket_id: ticket.id, sender_id: user.id, message: body.message });
  if (messageError) return NextResponse.json({ error: messageError.message }, { status: 400 });
  return NextResponse.json({ data: ticket }, { status: 201 });
}
