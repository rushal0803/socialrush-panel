"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/security/request";

const field = (form: FormData, key: string, max: number, required = false) => {
  const value = String(form.get(key) || "").trim();
  if ((required && !value) || value.length > max || /<\/?[a-z][\s\S]*>/i.test(value)) throw new Error(`Enter a valid ${key.replace("_", " ")}.`);
  return value || null;
};
async function auth() { const db = await createClient(); const { data: { user } } = await db.auth.getUser(); if (!user) redirect("/login"); return { db, user }; }
export async function saveClient(form: FormData) { const { db, user } = await auth(); const id = String(form.get("id") || ""); if (id && !isUuid(id)) throw new Error("Invalid client."); const row = { user_id: user.id, name: field(form, "name", 120, true), contact_name: field(form, "contact_name", 120), email: field(form, "email", 320), notes: field(form, "notes", 2000), updated_at: new Date().toISOString() }; const { error } = id ? await db.from("customer_clients").update(row).eq("id", id).eq("user_id", user.id) : await db.from("customer_clients").insert(row); if (error) throw new Error("Unable to save this client."); revalidatePath("/dashboard/clients"); }
export async function archiveClient(form: FormData) { const { db, user } = await auth(); const id = String(form.get("id") || ""); if (!isUuid(id)) throw new Error("Invalid client."); await db.from("customer_clients").update({ archived_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id); revalidatePath("/dashboard/clients"); }
export async function restoreClient(form: FormData) { const { db, user } = await auth(); const id = String(form.get("id") || ""); if (!isUuid(id)) throw new Error("Invalid client."); await db.from("customer_clients").update({ archived_at: null }).eq("id", id).eq("user_id", user.id); revalidatePath("/dashboard/clients"); revalidatePath(`/dashboard/clients/${id}`); }
export async function linkProfile(form: FormData) { const { db } = await auth(); const clientId = String(form.get("client_id") || ""); const profileId = String(form.get("profile_id") || ""); if (!isUuid(clientId) || !isUuid(profileId)) throw new Error("Invalid profile link."); const { error } = await db.from("client_social_profiles").insert({ client_id: clientId, saved_profile_id: profileId }); if (error && error.code !== "23505") throw new Error("Unable to link profile."); revalidatePath("/dashboard/clients"); }
