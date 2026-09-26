import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { DISPLAY_CURRENCY_COOKIE, getDisplayCurrencyForCountry, isCurrency } from "@/lib/currency";
import { commercialCanonicalRedirects } from "@/lib/seo/query-ownership";

const canonicalRedirects: Record<string, string> = {
  ...commercialCanonicalRedirects,
  "/privacy": "/privacy-policy",
  "/refund": "/refund-policy",
  "/testimonials": "/reviews",
  "/terms": "/terms-and-conditions",
};

export async function middleware(request: NextRequest) {
  const requestHost = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.toLowerCase();
  const shouldUseCanonicalHost = requestHost === "getsocialrush.com";
  const shouldUseHttps =
    requestHost === "www.getsocialrush.com" &&
    (forwardedProto === "http" || request.nextUrl.protocol === "http:");

  if (shouldUseCanonicalHost || shouldUseHttps) {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.protocol = "https:";
    canonicalUrl.hostname = "www.getsocialrush.com";
    canonicalUrl.port = "";
    return NextResponse.redirect(canonicalUrl, 308);
  }

  const isProductionHost =
  requestHost === "getsocialrush.com" ||
  requestHost === "www.getsocialrush.com";

const canonicalDestination = isProductionHost
  ? canonicalRedirects[request.nextUrl.pathname]
  : undefined;
  if (canonicalDestination) {
    const canonicalUrl = new URL(canonicalDestination, request.url);
    canonicalUrl.protocol = "https:";
    canonicalUrl.hostname = "www.getsocialrush.com";
    canonicalUrl.port = "";
    canonicalUrl.search = request.nextUrl.search;
    return NextResponse.redirect(canonicalUrl, 301);
  }

  const response = await updateSession(request);
  // Only Vercel's edge header is used; unverified deployments stay with INR.
  const savedCurrency = request.cookies.get(DISPLAY_CURRENCY_COOKIE)?.value;
  if (!isCurrency(savedCurrency) && process.env.VERCEL === "1") {
    response.cookies.set(DISPLAY_CURRENCY_COOKIE, getDisplayCurrencyForCountry(request.headers.get("x-vercel-ip-country")), { path: "/", maxAge: 31536000, sameSite: "lax", secure: true });
  }
  const pathname = request.nextUrl.pathname;
  const isPrivateOrMachineRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/auth/") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/verify-email" ||
    pathname.startsWith("/packages/checkout");
  const isPrivateShortcut =
    pathname === "/account" ||
    pathname === "/wallet" ||
    pathname === "/orders" ||
    pathname === "/billing" ||
    pathname === "/new-campaign" ||
    pathname === "/order-summary" ||
    pathname.startsWith("/packages/summary");

  if (isPrivateOrMachineRoute || isPrivateShortcut) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
