import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const requestHost = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  if (requestHost === "getsocialrush.com") {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.protocol = "https:";
    canonicalUrl.host = "www.getsocialrush.com";
    return NextResponse.redirect(canonicalUrl, 308);
  }

  const response = await updateSession(request);
  const pathname = request.nextUrl.pathname;
  const isPrivateOrMachineRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/auth/") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/packages/checkout");
  const isPrivateShortcut =
    pathname === "/account" ||
    pathname === "/wallet" ||
    pathname === "/orders" ||
    pathname === "/billing" ||
    pathname === "/support" ||
    pathname === "/new-campaign" ||
    pathname === "/order-summary";

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
