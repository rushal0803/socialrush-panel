import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeSupportText, supportError } from "@/lib/support/customer";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { message?: unknown } | null;
  const message = safeSupportText(body?.message, 10, 4000);
  if (!message) return NextResponse.json({ error: "Enter a reply between 10 and 4,000 characters without HTML." }, { status: 422 });
  const { error } = await supabase.rpc("reply_to_support_ticket", { p_ticket_id: params.id, p_message: message });
  if (error) return NextResponse.json({ error: supportError(error.message) }, { status: 400 });
  return NextResponse.json({ ok: true });
}
