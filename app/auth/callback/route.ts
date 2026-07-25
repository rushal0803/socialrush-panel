import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ensureUserProfile } from "@/lib/auth/ensure-profile";
import { getSupabaseConfig } from "@/lib/supabase/config";
import {
  ADMIN_DESTINATION,
  DEFAULT_CUSTOMER_DESTINATION,
  getSafeCustomerDestination,
} from "@/lib/auth/destination";

/**
 * OAuth Callback Route
 *
 * Handles authentication callbacks for:
 * - Email/Password confirmation links
 * - OAuth providers (Google, GitHub, etc.)
 *
 * SUPABASE GOOGLE OAUTH CONFIGURATION REMINDER:
 * 1. In Supabase Dashboard go to Authentication > Providers > Google.
 * 2. Enable Google provider.
 * 3. Add Google Client ID and Google Client Secret.
 * 4. In Google Cloud Console OAuth app, add redirect URI:
 *    https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
 * 5. In Supabase Authentication > URL Configuration:
 *    Site URL: https://www.getsocialrush.com
 * 6. Additional Redirect URLs should include:
 *    http://localhost:3000/**
 *    https://www.getsocialrush.com/**
 *    https://getsocialrush.com/**
 */

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const code = searchParams.get("code");
  const isPasswordReset = searchParams.get("next") === "/reset-password";
  const customerDestination = getSafeCustomerDestination(
    searchParams.get("next"),
  );

  if (code) {
    const destination = new URL(
      isPasswordReset ? "/reset-password" : customerDestination,
      requestUrl.origin,
    );
    const response = NextResponse.redirect(destination);
    const { url, key } = getSupabaseConfig();
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !isPasswordReset) {
        const profile = await ensureUserProfile(supabase, user).catch(() => null);
        if (profile?.role === "admin") {
          destination.pathname = ADMIN_DESTINATION;
          destination.search = "";
          destination.hash = "";
          response.headers.set("location", destination.toString());
        } else if (!destination.pathname || destination.pathname === "/") {
          // A signed-in customer must never land on the homepage.
          destination.pathname = DEFAULT_CUSTOMER_DESTINATION;
          response.headers.set("location", destination.toString());
        }
      }
      return response;
    }
  }

  const loginUrl = new URL("/login", requestUrl.origin);
  loginUrl.searchParams.set("authError", "oauth_callback_failed");
  return NextResponse.redirect(loginUrl);
}
