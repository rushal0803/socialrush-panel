import "server-only";

import { cache } from "react";
import { ensureUserProfile } from "@/lib/auth/ensure-profile";
import { createClient } from "@/lib/supabase/server";

export const getDashboardContext = cache(async () => {
  const supabase = await createClient();

  const claimsResult = await supabase.auth.getClaims();
  const userId = String(claimsResult.data?.claims?.sub || "");

  if (!userId) {
    return { supabase, user: null, profile: null };
  }

  // getClaims() verifies the JWT and is substantially cheaper than a remote
  // getUser() call for every dashboard navigation. The session user is used
  // only after the verified subject has been established above.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let user = session?.user?.id === userId ? session.user : null;

  // Defensive fallback for unusual session/cookie states. Normal dashboard
  // navigation should not need this network request.
  if (!user) {
    const {
      data: { user: verifiedUser },
    } = await supabase.auth.getUser();
    user = verifiedUser;
  }

  if (!user) {
    return { supabase, user: null, profile: null };
  }

  const profile = await ensureUserProfile(supabase, user);
  return { supabase, user, profile };
});
