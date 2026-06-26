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
 * SUPABASE GOOGLE OAUTH CONFIGURATION REMINDER:
 * 1. In Supabase Dashboard go to Authentication > Providers > Google.
 * 2. Enable Google provider.
 * 3. Add Google Client ID and Google Client Secret.
 * 4. In Google Cloud Console OAuth app, add redirect URI:
 *    https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
 * 5. In Supabase Authentication > URL Configuration:
 *    Site URL: https://www.socialrush.site (or your production Vercel URL)
 * 6. Additional Redirect URLs should include:
 *    http://localhost:3000/**
 *    https://www.socialrush.site/**
 *    https://socialrush.site/**
 *    https://your-vercel-domain.vercel.app/**
 */

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
