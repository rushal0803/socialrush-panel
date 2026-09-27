import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "./config";
import { getSafeCustomerDestination } from "@/lib/auth/destination";

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
  "/support",
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
  const requestHeaders = new Headers(request.headers);
  if (pathname === "/admin/login") {
    requestHeaders.set("x-socialrush-admin-login", "1");
  }

  const isProtected = shouldProtect(pathname);
  let response = NextResponse.next({ request: { headers: requestHeaders } });

  // Marketing routes determine signed-in state in their small client header and
  // do not need an authenticated server request.  Skipping the Supabase round
  // trip here keeps public-page TTFB independent of auth availability.  Routes
  // that enforce ownership/roles continue through the full session refresh.
  if (!isProtected) return response;

  const { url, key } = getSupabaseConfig();

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  let userId = "";
  try {
    const claimsResult = await supabase.auth.getClaims();
    userId = String(claimsResult.data?.claims?.sub || "");
  } catch (error) {
    const code =
      typeof error === "object" && error && "code" in error
        ? String((error as { code?: unknown }).code || "")
        : "";
    if (code !== "refresh_token_not_found") throw error;
  }

  if (!userId) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = pathname.startsWith("/admin") ? "/admin/login" : "/login";
    loginUrl.search = "";
    if (!pathname.startsWith("/admin")) {
      loginUrl.searchParams.set(
        "next",
        getSafeCustomerDestination(`${pathname}${request.nextUrl.search}`),
      );
    }
    const redirectResponse = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    for (const cookie of request.cookies.getAll()) {
      if (cookie.name.startsWith("sb-") || cookie.name.includes("auth-token")) {
        redirectResponse.cookies.delete(cookie.name);
      }
    }
    return redirectResponse;
  }

  // Dashboard layout performs the profile/block check once for the whole
  // authenticated tree. Avoid a duplicate profile round-trip in middleware.
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return response;
  }

  const { data: accessProfile, error: accessProfileError } = await supabase
    .from("profiles")
    .select("role,is_blocked")
    .eq("id", userId)
    .maybeSingle();

  if (pathname.startsWith("/admin")) {
    if (accessProfileError || !accessProfile) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.search = "";
      const redirectResponse = NextResponse.redirect(loginUrl);
      response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
      return redirectResponse;
    }

    if (accessProfile.role !== "admin") {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard/new-order";
      dashboardUrl.search = "";
      const redirectResponse = NextResponse.redirect(dashboardUrl);
      response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
      return redirectResponse;
    }
  }

  if (accessProfile?.is_blocked) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "error=account_blocked";
    const redirectResponse = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  return response;
}
