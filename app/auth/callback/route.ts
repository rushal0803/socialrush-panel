import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl, getSiteUrl } from "@/lib/auth/site-url";
import { ensureUserProfile } from "@/lib/auth/ensure-profile";

/**
 * OAuth Callback Route
 * 
 * Handles authentication callbacks for:
 * - Email/Password confirmation links
 * - OAuth providers (Google, GitHub, etc.)
 * 
 * GOOGLE OAUTH CONFIGURATION:
 * Google Sign-In requires enabling the Google provider in Supabase:
 * 1. Go to Supabase Dashboard > Authentication > Providers
 * 2. Enable Google provider
 * 3. Add your Google OAuth Client ID and Secret (from Google Cloud Console)
 * 4. Add authorized redirect URIs in Google Cloud Console:
 *    - For local: http://localhost:3000/auth/callback
 *    - For production: https://yourdomain.com/auth/callback
 * 5. The system will automatically handle the OAuth flow
 */

const callbackDestinations = new Set(["/dashboard", "/reset-password"]);

function isSafeRedirect(path: string) {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("://");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next") || "/dashboard";
  const next = isSafeRedirect(requestedNext) ? requestedNext : "/dashboard";
  const siteUrl = getSiteUrl({ headers: request.headers, requestUrl: request.url });

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await ensureUserProfile(supabase, user).catch(() => null);
      return NextResponse.redirect(absoluteUrl(next, siteUrl));
    }
  }

  return NextResponse.redirect(absoluteUrl("/login", siteUrl));
}
