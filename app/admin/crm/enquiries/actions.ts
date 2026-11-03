"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export async function updateWebsiteEnquiry(form: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Admin login required.");
  const { data: profile, error: profileError } = await supabase.from("profiles")
    .select("role").eq("id", user.id).single();
  if (profileError || profile?.role !== "admin") throw new Error("Admin access required.");

  const id = String(form.get("enquiry_id") || "");
  if (!isUuid(id)) throw new Error("Invalid enquiry ID.");
  const operation = String(form.get("operation") || "");
  const patch: Record<string, string> = { updated_at: new Date().toISOString() };
  if (operation === "status") {
    const status = String(form.get("status") || "");
    if (!["new", "working", "replied", "closed"].includes(status)) throw new Error("Invalid status.");
    patch.status = status;
  } else if (operation === "draft") {
    const draft = String(form.get("reply_draft") || "").trim();
    if (!draft || draft.length > 4000) throw new Error("Reply draft must be 1–4000 characters.");
    patch.reply_draft = draft;
  } else {
    throw new Error("Unknown CRM action.");
  }
  const { data, error } = await supabase.from("crm_website_enquiries")
    .update(patch).eq("id", id).select("id").maybeSingle();
  if (error || !data) throw new Error("Could not update this enquiry.");
  revalidatePath("/admin/crm/enquiries");
}


/** Human-initiated conversion. SQL RPC is transactional and retains existing admin RLS. */
export async function promoteWebsiteEnquiry(form: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Admin login required.");
  const { data: profile, error: profileError } = await supabase.from("profiles")
    .select("role").eq("id", user.id).single();
  if (profileError || profile?.role !== "admin") throw new Error("Admin access required.");

  const enquiryId = String(form.get("enquiry_id") || "");
  const businessName = String(form.get("business_name") || "").trim();
  if (!isUuid(enquiryId)) throw new Error("Invalid enquiry ID.");
  if (businessName.length < 2 || businessName.length > 140) {
    throw new Error("Business or creator name must be 2 to 140 characters.");
  }

  const { data, error } = await supabase.rpc("promote_crm_website_enquiry", {
    p_enquiry_id: enquiryId,
    p_business_name: businessName,
  }).single();
  if (error || !data) {
    console.error("[crm] website enquiry promotion failed", { code: error?.code || "no_result" });
    throw new Error("Could not link this enquiry to the sales pipeline. Check existing contacts and suppression before trying again.");
  }
  revalidatePath("/admin/crm/enquiries");
  revalidatePath("/admin/crm/leads");
  revalidatePath("/admin/crm/pipeline");
}
