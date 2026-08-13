import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SavedProfilesManager, { type SavedProfile } from "./SavedProfilesManager";

export default async function SavedProfilesPage() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await db
    .from("saved_social_profiles")
    .select("id,label,platform,public_url,note,created_at,updated_at,last_used_at")
    .eq("user_id", user.id)
    .order("last_used_at", { ascending: false, nullsFirst: false });

  return <SavedProfilesManager profiles={(data || []) as SavedProfile[]} loadError={Boolean(error)} />;
}
