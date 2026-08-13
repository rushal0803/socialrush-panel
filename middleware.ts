import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { DISPLAY_CURRENCY_COOKIE, getDisplayCurrencyForCountry, isCurrency } from "@/lib/currency";

const canonicalRedirects: Record<string, string> = {
  "/buy-instagram-followers": "/buy-instagram-followers-india",
  "/instagram-followers": "/buy-instagram-followers-india",
  "/buy-instagram-likes-india": "/instagram-likes",
  "/buy-instagram-views-india": "/instagram-views",
  "/buy-youtube-subscribers-india": "/youtube-subscribers",
  "/buy-youtube-likes-india": "/youtube-likes",
  "/buy-youtube-views-india": "/youtube-views",
  "/buy-linkedin-followers-india": "/linkedin-followers",
  "/buy-linkedin-likes-india": "/linkedin-likes",
  "/buy-twitter-followers-india": "/twitter-followers",
  "/facebook-followers": "/buy-facebook-followers-india",
  "/buy-facebook-likes-india": "/facebook-likes",
  "/buy-telegram-members-india": "/telegram-members",
  "/buy-tiktok-followers-india": "/tiktok-followers",
  "/privacy": "/privacy-policy",
  "/refund": "/refund-policy",
  "/testimonials": "/reviews",
  "/services/facebook-brand-engagement": "/facebook-followers",
  "/services/instagram-audience-growth": "/buy-instagram-followers-india",
  "/services/instagram-content-reach": "/instagram-views",
  "/services/instagram-engagement-boost": "/instagram-likes",
  "/services/instagram-followers": "/buy-instagram-followers-india",
  "/services/instagram-likes": "/instagram-likes",
  "/services/instagram-views": "/instagram-views",
  "/services/linkedin-followers": "/linkedin-followers",
  "/services/linkedin-likes": "/linkedin-likes",
  "/services/linkedin-professional-growth": "/linkedin-followers",
  "/services/smm-panel-india": "/services",
  "/services/facebook-followers": "/facebook-followers",
  "/services/facebook-likes": "/facebook-likes",
  "/services/telegram-members": "/telegram-members",
  "/services/tiktok-followers": "/tiktok-followers",
  "/services/x-authority-growth": "/twitter-followers",
  "/services/x-followers": "/twitter-followers",
  "/services/youtube-channel-growth": "/youtube-subscribers",
  "/services/youtube-likes": "/youtube-likes",
  "/services/youtube-subscribers": "/youtube-subscribers",
  "/services/youtube-video-promotion": "/youtube-views",
  "/services/youtube-views": "/youtube-views",
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
