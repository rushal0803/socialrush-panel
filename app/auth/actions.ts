"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl, getSiteUrl } from "@/lib/auth/site-url";

function authErrorUrl(siteUrl: string, path: string, message: string) {
  const url = new URL(path, `${siteUrl}/`);
  url.searchParams.set("error", message);
  return url.toString();
}

async function getRequestSiteUrl() {
  const headerStore = await headers();
  return getSiteUrl({ headers: headerStore });
}

function callbackUrl(siteUrl: string, next: "/dashboard" | "/reset-password") {
  const url = new URL("/auth/callback", `${siteUrl}/`);
  url.searchParams.set("next", next);
  return url.toString();
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/dashboard");
  const siteUrl = await getRequestSiteUrl();
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const errorUrl = new URL(authErrorUrl(siteUrl, "/login", error.message));
    if (next === "/dashboard" || next.startsWith("/dashboard/")) errorUrl.searchParams.set("next", next);
    redirect(errorUrl.toString());
  }
  revalidatePath("/", "layout");
  const destination = next === "/dashboard" || next.startsWith("/dashboard/") ? next : "/dashboard";
  redirect(absoluteUrl(destination, siteUrl));
}

export async function register(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = `${String(formData.get("firstName") || "").trim()} ${String(formData.get("lastName") || "").trim()}`.trim();
  const siteUrl = await getRequestSiteUrl();
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: callbackUrl(siteUrl, "/dashboard"),
    },
  });
  if (error) redirect(authErrorUrl(siteUrl, "/register", error.message));
  const verifyUrl = new URL("/verify-email", `${siteUrl}/`);
  verifyUrl.searchParams.set("email", email);
  redirect(verifyUrl.toString());
}

export async function forgotPassword(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const siteUrl = await getRequestSiteUrl();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callbackUrl(siteUrl, "/reset-password"),
  });
  if (error) redirect(authErrorUrl(siteUrl, "/forgot-password", error.message));
  redirect(absoluteUrl("/forgot-password?sent=1", siteUrl));
}

export async function resetPassword(formData: FormData) {
  const siteUrl = await getRequestSiteUrl();
  const password = String(formData.get("password") || "");
  const confirmation = String(formData.get("confirmation") || "");
  if (password.length < 8) redirect(authErrorUrl(siteUrl, "/reset-password", "Password must be at least 8 characters."));
  if (password !== confirmation) redirect(authErrorUrl(siteUrl, "/reset-password", "Passwords do not match."));
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(authErrorUrl(siteUrl, "/reset-password", error.message));
  redirect(absoluteUrl("/dashboard?password_updated=1", siteUrl));
}

export async function logout() {
  const siteUrl = await getRequestSiteUrl();
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(absoluteUrl("/login", siteUrl));
}
