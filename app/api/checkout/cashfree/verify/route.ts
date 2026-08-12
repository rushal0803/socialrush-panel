import { NextResponse, type NextRequest } from "next/server";
import { verifyCashfreeDirectCheckout } from "@/lib/payments/cashfree-direct-verification";
import { requireJson, requireSameOrigin, rateLimit } from "@/lib/security/request";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const originError = requireSameOrigin(request); if (originError) return originError;
  const jsonError = requireJson(request); if (jsonError) return jsonError;
  const limited = rateLimit(request, "cashfree-direct-verify", 15, 60_000, user.id); if (limited) return limited;
  const body = await request.json().catch(() => null) as { orderId?: string } | null;
  const orderId = body?.orderId;
  if (!orderId || !/^src_[a-f0-9]{32}$/i.test(orderId)) return NextResponse.json({ error: "Invalid payment reference." }, { status: 422 });

  const result = await verifyCashfreeDirectCheckout(orderId, user.id);
  if (result.kind === "not_found") return NextResponse.json({ error: "Checkout payment not found." }, { status: 404 });
  if (result.kind === "mismatch") return NextResponse.json({ error: "Payment details did not match the checkout." }, { status: 409 });
  if (result.kind === "finalizing") return NextResponse.json({ error: "Payment is verified and is being finalized. Please check Orders shortly." }, { status: 409 });
  if (result.kind === "success") return NextResponse.json({ data: { status: "success", orderId: result.orderId, balance: result.balance, duplicate: result.duplicate } });
  return NextResponse.json({ data: { status: result.kind } });
}
