import "server-only";

import { cache } from "react";
import { ensureUserProfile } from "@/lib/auth/ensure-profile";
import { createClient } from "@/lib/supabase/server";

export const getDashboardContext = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, profile: null };
  }

  const profile = await ensureUserProfile(supabase, user);
  return { supabase, user, profile };
});
