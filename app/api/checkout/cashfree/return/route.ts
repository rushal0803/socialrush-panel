import { NextResponse, type NextRequest } from "next/server";
import { verifyCashfreeDirectCheckout } from "@/lib/payments/cashfree-direct-verification";
import { createClient } from "@/lib/supabase/server";

function safeReturnPath(value: string | null) {
  if (!value || !value.startsWith("/dashboard/") || value.startsWith("//")) return "/dashboard/new-order";
  return value;
}

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("order_id") || request.nextUrl.searchParams.get("cashfree_order_id");
  const returnPath = safeReturnPath(request.nextUrl.searchParams.get("return_path"));
  if (!orderId || !/^src_[a-f0-9]{32}$/i.test(orderId)) return NextResponse.redirect(new URL(returnPath, request.url));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${returnPath}${returnPath.includes("?") ? "&" : "?"}cashfree_order_id=${encodeURIComponent(orderId)}`);
    return NextResponse.redirect(login);
  }

  const result = await verifyCashfreeDirectCheckout(orderId, user.id);
  if (result.kind === "success") return NextResponse.redirect(new URL("/dashboard/orders", request.url));

  const destination = new URL(returnPath, request.url);
  destination.searchParams.set("cashfree_order_id", orderId);
  if (result.kind !== "not_found") destination.searchParams.set("checkout_intent", result.checkoutIntentId);
  return NextResponse.redirect(destination);
}
