export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are not configured.");
  let parsed: URL;
  try { parsed = new URL(url); } catch { throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid absolute project URL."); }
  if (!/^https?:$/.test(parsed.protocol) || parsed.pathname.replace(/\/+$/, "") === "/rest/v1") {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be the Supabase project URL, not a REST endpoint.");
  }
  return { url: parsed.origin, key };
}
