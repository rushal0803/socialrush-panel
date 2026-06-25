import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/services",
  "/packages",
  "/pricing",
  "/contact",
  "/privacy",
  "/terms",
  "/terms-and-conditions",
  "/refund-policy",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/blog",
  "/case-studies",
  "/about",
  "/faq",
];

const PROTECTED_ROOTS = [
  "/dashboard",
  "/dashboard/new-order",
  "/dashboard/services",
  "/dashboard/orders",
  "/dashboard/wallet",
  "/dashboard/billing",
  "/dashboard/support",
  "/dashboard/account",
  "/dashboard/settings",
  "/packages/summary",
  "/checkout",
  "/order",
  "/payment",
  "/account",
  "/wallet",
  "/support",
  "/new-campaign",
  "/orders",
  "/billing",
  "/admin",
];

function shouldProtect(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return false;
  return PROTECTED_ROOTS.some((root) => pathname === root || pathname.startsWith(`${root}/`));
}

export async function requireAuth(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!shouldProtect(pathname)) {
    return null;
  }

  const { url, key } = getSupabaseConfig();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (user) return null;

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = `next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
  return NextResponse.redirect(loginUrl);
}
