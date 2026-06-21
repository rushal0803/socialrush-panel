import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl, getSiteUrl } from "@/lib/auth/site-url";
import { ensureUserProfile } from "@/lib/auth/ensure-profile";

const callbackDestinations = new Set(["/dashboard", "/reset-password"]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next") || "/dashboard";
  const next = callbackDestinations.has(requestedNext) ? requestedNext : "/dashboard";
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
