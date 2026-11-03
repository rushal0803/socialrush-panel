"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { gscKinds, parseGscCsv, parseGscDate, type GscKind } from "@/lib/seo/gsc-csv-import";

const route = "/admin/crm/growth-hub/gsc";

const field = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
function bounce(key: "error" | "imported", value: string): never {
  redirect(route + "?" + key + "=" + encodeURIComponent(value.slice(0, 180)));
}
export async function importGscCsv(form: FormData): Promise<void> {
  const db = await createClient();
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (authError || !user) bounce("error", "You must sign in as an administrator.");
  const { data: profile, error: profileError } = await db.from("profiles").select("role").eq("id",user.id).single();
  if (profileError || profile?.role !== "admin") bounce("error", "Administrator access required.");

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > 750_000 || !file.name.toLowerCase().endsWith(".csv")) {
    bounce("error", "Upload a UTF-8 CSV under 750 KB exported from Google Search Console.");
  }
  const kind = field(form,"report_kind") as GscKind;
  if (!gscKinds.includes(kind)) bounce("error", "Choose a supported GSC report type.");
  const evidence = field(form,"evidence_date");
  let evidenceDate: string, periodStart: string | null = null, periodEnd: string | null = null;
  try {
    evidenceDate = parseGscDate(evidence);
    if (kind === "performance_pages") {
      periodStart = parseGscDate(field(form,"period_start"));
      periodEnd = parseGscDate(field(form,"period_end"));
      if (periodStart > periodEnd || Date.parse(periodEnd) - Date.parse(periodStart) > 366*86400000) {
        throw new Error("The performance date range must be chronological and no longer than one year.");
      }
    }
  } catch(e) {
    bounce("error", e instanceof Error ? e.message : "Invalid evidence date.");
  }
  const fileText = await file.text();
  let parsed: ReturnType<typeof parseGscCsv>;
  try { parsed = parseGscCsv(fileText,kind,field(form,"indexing_reason")); }
  catch(e) { bounce("error",e instanceof Error?e.message:"CSV could not be read."); }
  if (parsed.rows.length === 0) bounce("error", "No valid page rows to import.");

  // Scope idempotency to BOTH file content and report provenance. Never
  // combine metrics from different search windows without explicit review.
  const fingerprint = createHash("sha256").update(JSON.stringify({
    kind, reason:parsed.reason, evidenceDate, periodStart, periodEnd, body:fileText,
  })).digest("hex");
  const { data:batch, error:batchError } = await db.from("growth_gsc_import_batches").insert({
    fingerprint, report_kind:kind, reason:parsed.reason, evidence_date:evidenceDate,
    period_start:periodStart, period_end:periodEnd,
    filename:file.name.slice(0,160), row_count:parsed.rows.length,
    status:"processing", created_by:user.id,
  }).select("id").single();
  if (batchError || !batch) {
    if (batchError?.code === "23505") bounce("error", "This exact export and date range were already imported.");
    console.error("[gsc-import] batch create", { code:batchError?.code });
    bounce("error", "Cannot save this export. Check the Phase 3 database migration.");
  }

  let failure: string | null = null;
  for (let at=0;at<parsed.rows.length;at+=60) {
    const subset=parsed.rows.slice(at,at+60).map(row=>({
      batch_id:batch.id, source_path:row.source_path, canonical_path:row.canonical_path,
      clicks:row.clicks, impressions:row.impressions, ctr:row.ctr, position:row.position,
      created_by:user.id,
    }));
    const {error} = await db.from("growth_gsc_page_observations").insert(subset);
    if (error) { console.error("[gsc-import] rows",{code:error.code});failure="Could not save all page rows.";break; }
  }
  const {error:statusError} = await db.from("growth_gsc_import_batches")
    .update({status:failure?"failed":"complete"}).eq("id",batch.id).eq("status","processing");
  if(statusError || failure) bounce("error","Import not completed. A partial batch was marked failed for investigation; nothing is shown as a complete report.");
  revalidatePath(route);
  bounce("imported",String(parsed.rows.length));
}
