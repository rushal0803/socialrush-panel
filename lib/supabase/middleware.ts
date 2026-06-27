import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "./config";

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
  if (pathname === "/admin/login") return false;
  if (PUBLIC_PATHS.includes(pathname)) return false;
  return PROTECTED_ROOTS.some((root) => pathname === root || pathname.startsWith(`${root}/`));
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname === "/admin/login") {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-socialrush-admin-login", "1");
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const isProtected = shouldProtect(pathname);
  if (!isProtected) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const { url, key } = getSupabaseConfig();

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = pathname.startsWith("/admin") ? "/admin/login" : "/login";
    loginUrl.search = `next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
    return NextResponse.redirect(loginUrl);
  }

  const { data: roleProfile, error: roleError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (pathname.startsWith("/admin")) {
    if (roleError || !roleProfile) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.search = "";
      return NextResponse.redirect(loginUrl);
    }

    if (roleProfile.role !== "admin") {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard";
      dashboardUrl.search = "";
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Keep the role check independent so a deployment that has not added the
  // optional is_blocked column yet cannot misclassify an administrator.
  const { data: blockedProfile } = await supabase
    .from("profiles")
    .select("is_blocked")
    .eq("id", user.id)
    .maybeSingle();

  if (blockedProfile?.is_blocked) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "error=account_blocked";
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
