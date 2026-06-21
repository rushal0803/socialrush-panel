import type { SupabaseClient, User } from "@supabase/supabase-js";

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  balance: number;
  role: "user" | "admin";
};

export class ProfileSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfileSetupError";
  }
}

function profileName(user: User) {
  return typeof user.user_metadata?.full_name === "string"
    ? user.user_metadata.full_name.trim()
    : "";
}

function isMissingTable(error: { code?: string; message?: string }) {
  return error.code === "42P01" || error.code === "PGRST205" || /profiles.*(does not exist|schema cache)/i.test(error.message || "");
}

function setupError(error: { code?: string; message?: string }) {
  if (isMissingTable(error)) {
    return new ProfileSetupError("The profiles table is not available. Apply the latest Supabase migrations before using the dashboard.");
  }
  if (error.code === "42501" || /row-level security|permission denied/i.test(error.message || "")) {
    return new ProfileSetupError("Profile creation is not configured. Apply the latest profile self-healing migration in Supabase.");
  }
  return new ProfileSetupError(error.message || "Unable to load your account profile.");
}

const profileColumns = "id, email, full_name, balance, role";

export async function ensureUserProfile(supabase: SupabaseClient, user: User): Promise<UserProfile> {
  const existing = await supabase.from("profiles").select(profileColumns).eq("id", user.id).maybeSingle();
  if (existing.error) throw setupError(existing.error);
  if (existing.data) return { ...existing.data, balance: Number(existing.data.balance ?? 0) } as UserProfile;

  const values = {
    id: user.id,
    email: user.email || "",
    full_name: profileName(user),
    role: "user" as const,
    balance: 0,
  };
  const created = await supabase.from("profiles").insert(values).select(profileColumns).single();

  if (created.error?.code === "23505") {
    const raced = await supabase.from("profiles").select(profileColumns).eq("id", user.id).single();
    if (raced.error) throw setupError(raced.error);
    return { ...raced.data, balance: Number(raced.data.balance ?? 0) } as UserProfile;
  }
  if (created.error) throw setupError(created.error);
  return { ...created.data, balance: Number(created.data.balance ?? 0) } as UserProfile;
}
