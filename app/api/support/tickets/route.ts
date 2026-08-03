import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordTrustedEvent } from "@/lib/analytics/server";
import { safePaymentReference, safeSupportText, supportError } from "@/lib/support/customer";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("support_tickets").select("id, subject, category, status, order_id, payment_reference, customer_last_read_at, created_at, updated_at, last_reply_at, orders(id,platform,service_name,status,refill_eligible,services(refill_policy))").order("updated_at", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: "Tickets could not be loaded. Please try again." }, { status: 400 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { category?: string; subject?: string; message?: string; orderId?: string | null; paymentReference?: string } | null;
  const subject = safeSupportText(body?.subject, 5, 120);
  const message = safeSupportText(body?.message, 10, 4000);
  const paymentReference = body?.paymentReference ? safePaymentReference(body.paymentReference) : null;
  if (!subject) return NextResponse.json({ error: "Enter a subject between 5 and 120 characters without HTML." }, { status: 422 });
  if (!message) return NextResponse.json({ error: "Enter a message between 10 and 4,000 characters without HTML." }, { status: 422 });
  if (body?.paymentReference && !paymentReference) return NextResponse.json({ error: "Enter a valid payment or transaction reference." }, { status: 422 });
  const { data, error } = await supabase.rpc("create_support_ticket_with_reference", { p_category: body?.category, p_subject: subject, p_message: message, p_order_id: body?.orderId || null, p_payment_reference: paymentReference });
  if (error) return NextResponse.json({ error: supportError(error.message) }, { status: error.message.includes("already have") ? 409 : 400 });
  await recordTrustedEvent({eventName:"support_ticket_created",customerId:user.id,pagePath:"/dashboard/support",metadata:{category:String(body.category||"other")}});
  return NextResponse.json({ data: { id: data } }, { status: 201 });
}
