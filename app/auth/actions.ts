"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function authUrl(path: string, message: string) {
  return `${path}?error=${encodeURIComponent(message)}`;
}

async function getOrigin() {
  const headerStore = await headers();
  return process.env.NEXT_PUBLIC_SITE_URL || headerStore.get("origin") || "http://localhost:3000";
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/dashboard");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(authUrl("/login", error.message));
  revalidatePath("/", "layout");
  redirect(next.startsWith("/dashboard") ? next : "/dashboard");
}

export async function register(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = `${String(formData.get("firstName") || "").trim()} ${String(formData.get("lastName") || "").trim()}`.trim();
  const origin = await getOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });
  if (error) redirect(authUrl("/register", error.message));
  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}

export async function forgotPassword(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const origin = await getOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });
  if (error) redirect(authUrl("/forgot-password", error.message));
  redirect("/forgot-password?sent=1");
}

export async function resetPassword(formData: FormData) {
  const password = String(formData.get("password") || "");
  const confirmation = String(formData.get("confirmation") || "");
  if (password.length < 8) redirect(authUrl("/reset-password", "Password must be at least 8 characters."));
  if (password !== confirmation) redirect(authUrl("/reset-password", "Passwords do not match."));
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(authUrl("/reset-password", error.message));
  redirect("/dashboard?password_updated=1");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
