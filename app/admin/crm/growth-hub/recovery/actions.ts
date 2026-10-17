"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseRecoveryItem, validateRecoveryStatus } from "@/lib/seo/growth-recovery";

const route = "/admin/crm/growth-hub/recovery";

async function getAdminContext() {
  const db = await createClient();
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (authError || !user) throw new Error("Sign in as an administrator.");
  const { data: profile, error: profileError } = await db
    .from("profiles").select("role").eq("id", user.id).single();
  if (profileError || profile?.role !== "admin") throw new Error("Administrator access required.");
  return { db, user };
}

const value = (data: FormData, key: string) => String(data.get(key) ?? "");

export async function createRecoveryItem(data: FormData): Promise<void> {
  const { db, user } = await getAdminContext();
  const input = parseRecoveryItem({
    canonical_path: value(data, "canonical_path"),
    workstream: value(data, "workstream"),
    issue_type: value(data, "issue_type"),
    priority: value(data, "priority"),
    title: value(data, "title"),
    details: value(data, "details"),
    evidence_source: value(data, "evidence_source"),
    evidence_date: value(data, "evidence_date"),
  });

  const { error } = await db.from("growth_search_work_items").insert({
    ...input, status: "open", created_by: user.id, updated_by: user.id,
  });
  if (error) {
    // Avoid displaying raw database error content to admins as it may
    // contain arbitrary server details. Check duplicate before general errors.
    if (error.code === "23505") throw new Error("There is already an unresolved item with this URL and issue type.");
    console.error("[growth-recovery] create failed", { code: error.code });
    throw new Error("Could not save the recovery item. Check that the database migration is deployed.");
  }
  revalidatePath(route);
}

export async function updateRecoveryItemStatus(data: FormData): Promise<void> {
  const { db, user } = await getAdminContext();
  const itemId = value(data, "item_id").trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(itemId)) {
    throw new Error("Invalid work item identifier.");
  }
  const resolutionNote = value(data, "resolution_note").trim();
  const status = validateRecoveryStatus(value(data, "status"), resolutionNote);
  const { error } = await db.from("growth_search_work_items")
    .update({
      status,
      resolution_note: resolutionNote || null,
      verified_at: status === "verified" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", itemId);
  if (error) {
    console.error("[growth-recovery] update failed", { code: error.code });
    throw new Error("Could not update the recovery item.");
  }
  revalidatePath(route);
}
