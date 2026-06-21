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
