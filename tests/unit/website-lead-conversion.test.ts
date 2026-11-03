import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const migration = readFileSync(resolve(root, "supabase/migrations/20261026064500_crm_enquiry_to_lead.sql"), "utf8");
const action = readFileSync(resolve(root, "app/admin/crm/enquiries/actions.ts"), "utf8");
const page = readFileSync(resolve(root, "app/admin/crm/enquiries/page.tsx"), "utf8");

test("enquiry promotion is atomic and preserves admin RLS without privilege escalation", () => {
  assert.match(migration, /security invoker/i);
  assert.doesNotMatch(migration, /security definer/i);
  assert.match(migration, /if auth\.uid\(\) is null or not public\.is_admin\(\)/i);
  assert.match(migration, /where id = p_enquiry_id for update/i);
  assert.match(migration, /pg_advisory_xact_lock/i);
  assert.match(migration, /revoke all on function public\.promote_crm_website_enquiry\(uuid, text\) from PUBLIC, anon, authenticated/i);
  assert.match(migration, /grant execute on function public\.promote_crm_website_enquiry\(uuid, text\) to authenticated/i);
});
test("only working sales enquiries can be manually promoted", () => {
  assert.match(migration, /v_enquiry\.category not in \('bulk', 'guidance'\) or v_enquiry\.status <> 'working'/);
  assert.match(page, /row\.status === "working"/);
  assert.match(page, /action=\{promoteWebsiteEnquiry\}/);
  assert.match(action, /profile\?\.role !== "admin"/);
  assert.match(action, /supabase\.rpc\("promote_crm_website_enquiry"/);
});
test("duplicates, unsubscribes and blocked contacts prevent unsafe conversion", () => {
  assert.match(migration, /v_enquiry\.lead_id is not null/);
  assert.match(migration, /'already_linked'::text/);
  assert.match(migration, /crm_suppression_list/);
  assert.match(migration, /opted_out_at is not null or c\.compliance_status = 'blocked'/);
  assert.match(migration, /pg_catalog\.cardinality\(v_matched_leads\) > 1/);
  assert.match(migration, /'linked_existing'::text/);
  assert.match(migration, /A lead with this business name exists/i);
});
test("linked contact is unverified and under review, never subscribed", () => {
  assert.match(migration, /'unknown', 'unverified',\s*'review', 'existing_relationship', true, v_enquiry\.source/);
  assert.match(migration, /v_company, 'business', 'web', 'Website inbound enquiry', v_enquiry\.source/);
  assert.doesNotMatch(migration, /marketing_opt_in\s*=\s*true|auto_send\s*=\s*true|crm_lead_enrollments/);
  assert.doesNotMatch(action, /emails\.send|api\.resend\.com\/emails|auto_send/);
});
test("promoted enquiry shows a CRM lead link, not a paid conversion", () => {
  assert.match(migration, /lead_id uuid references public\.crm_leads\(id\) on delete set null/i);
  assert.match(page, /href=\{".*crm\/leads\/" \+ row\.lead_id\}/);
  assert.match(page, /not evidence of a completed sale/i);
});
