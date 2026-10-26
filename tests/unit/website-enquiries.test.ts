import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { websiteEnquiryCategory, websiteEnquiryReplyDraft, websiteEnquirySource } from "../../lib/crm/website-enquiries.ts";

test("partnership enquiries are separated from account and order support", () => {
  assert.equal(websiteEnquiryCategory("general", "Partnership Enquiry"), "bulk");
  assert.equal(websiteEnquiryCategory("order", "YouTube order help"), "order");
  assert.equal(websiteEnquiryCategory("unexpected", "service"), "general");
});
test("website enquiry source retains only allowlisted UTM values", () => {
  const source = websiteEnquirySource("/contact?utm_source=agency_partner&utm_campaign=distribution&email=private%40example.com&session=secret");
  assert.equal(source, "/contact?utm_source=agency_partner&utm_campaign=distribution");
  assert.equal(websiteEnquirySource("https://malicious.example/contact?utm_source=ads"), "/contact");
  assert.equal(websiteEnquirySource("/admin?utm_source=ads"), "/contact");
});
test("suggested replies are deterministic, minimal and don't execute or embed a request message", () => {
  const reply = websiteEnquiryReplyDraft("Jaya Sharma", "bulk");
  assert.match(reply, /Hi Jaya/);
  assert.match(reply, /partnership or campaign/);
  assert.doesNotMatch(reply, /guaranteed followers|guaranteed results/i);
  const invalid = websiteEnquiryReplyDraft("<script>alert(1)</script>", "general");
  assert.doesNotMatch(invalid, /<script>/);
});
test("private CRM schema limits public Data API and does not opt contacts into marketing", () => {
  const dir = dirname(fileURLToPath(import.meta.url));
  const schema = readFileSync(resolve(dir, "../../supabase/migrations/20261026060000_crm_website_enquiries.sql"), "utf8");
  assert.match(schema, /enable row level security/i);
  assert.match(schema, /revoke all on public\.crm_website_enquiries from PUBLIC, anon, authenticated/i);
  assert.match(schema, /marketing_opt_in boolean not null default false/i);
  assert.match(schema, /for select to authenticated/i);
});
test("website form persistence only suggests drafts; auto-send not activated", () => {
  const dir = dirname(fileURLToPath(import.meta.url));
  const contact = readFileSync(resolve(dir, "../../app/api/contact/route.ts"), "utf8");
  const action = readFileSync(resolve(dir, "../../app/admin/crm/enquiries/actions.ts"), "utf8");
  assert.match(contact, /from\("crm_website_enquiries"\)\.insert/);
  assert.match(contact, /marketing_opt_in: false/);
  assert.match(action, /profile\?\.role !== "admin"/);
  assert.doesNotMatch(action, /emails\.send|sendEmail\(|resend\.send|fetch\(.*resend/);
});
