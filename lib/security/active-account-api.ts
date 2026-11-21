import "server-only";
import { NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

// API requests do not always pass the /dashboard middleware guard.
// Always check the actual database account state before any wallet/order write.
export async function requireActiveAccountApi(
  supabase: ServerSupabase,
  userId: string,
): Promise<NextResponse | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_blocked")
    .eq("id", userId)
    .maybeSingle();

  // Fail closed if the account state is unreadable.
  if (error) {
    return NextResponse.json({ error: "Unable to verify account access." }, { status: 503 });
  }
  if (!profile || profile.is_blocked) {
    return NextResponse.json({ error: "Account access restricted." }, { status: 403 });
  }
  return null;
}
