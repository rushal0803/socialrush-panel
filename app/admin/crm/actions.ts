"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CrmPriority, FollowUpStatus, FollowUpType, LifecycleStage } from "@/lib/crm/types";

const lifecycle = new Set<LifecycleStage>(["lead","new_customer","active","vip","at_risk","inactive"]);
const priorities = new Set<CrmPriority>(["low","normal","high"]);
const followTypes = new Set<FollowUpType>(["general","sales","support","payment","refill","retention"]);
const followStatuses = new Set<FollowUpStatus>(["pending","completed","cancelled"]);
async function admin() { const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) throw new Error("Authentication required"); const {data:p}=await supabase.from("profiles").select("role").eq("id",user.id).single(); if(p?.role!=="admin") throw new Error("Admin access required"); return {supabase,user}; }
const value=(d:FormData,n:string)=>String(d.get(n)||"").trim();
const path=(id:string)=>`/admin/crm/customers/${id}`;
export async function saveCrmDetails(d:FormData) { const {supabase}=await admin(); const customerId=value(d,"customer_id"), stage=value(d,"lifecycle_stage") as LifecycleStage, priority=value(d,"priority") as CrmPriority; if(!customerId||!lifecycle.has(stage)||!priorities.has(priority)) throw new Error("Invalid CRM details."); const payload={customer_id:customerId,lifecycle_stage:stage,priority,lead_source:value(d,"lead_source")||null,internal_summary:value(d,"internal_summary")||null,last_contacted_at:value(d,"last_contacted_at")||null,next_follow_up_at:value(d,"next_follow_up_at")||null,updated_at:new Date().toISOString()}; const {error}=await supabase.from("crm_customer_profiles").upsert(payload,{onConflict:"customer_id"}); if(error) throw new Error(error.message); revalidatePath(path(customerId)); revalidatePath("/admin/crm"); revalidatePath("/admin/crm/customers"); }
export async function addNote(d:FormData) { const {supabase,user}=await admin(); const customerId=value(d,"customer_id"),note=value(d,"note"); if(!customerId||note.length<1||note.length>5000) throw new Error("A note up to 5000 characters is required."); const {error}=await supabase.from("crm_notes").insert({customer_id:customerId,note,created_by:user.id});if(error)throw new Error(error.message);revalidatePath(path(customerId)); }
export async function deleteNote(d:FormData) { const {supabase}=await admin();const id=value(d,"note_id"),customerId=value(d,"customer_id");const {error}=await supabase.from("crm_notes").delete().eq("id",id);if(error)throw new Error(error.message);revalidatePath(path(customerId)); }
export async function setCustomerTags(d:FormData) { const {supabase}=await admin(); const customerId=value(d,"customer_id"),tagIds=d.getAll("tag_ids").map(String); if(!customerId) throw new Error("Customer required."); const {error:removeError}=await supabase.from("crm_customer_tags").delete().eq("customer_id",customerId);if(removeError)throw new Error(removeError.message); if(tagIds.length){const {error}=await supabase.from("crm_customer_tags").insert(tagIds.map(tag_id=>({customer_id:customerId,tag_id})));if(error)throw new Error(error.message)} revalidatePath(path(customerId));revalidatePath("/admin/crm/customers"); }
export async function saveFollowUp(d:FormData) { const {supabase,user}=await admin();const customerId=value(d,"customer_id"),title=value(d,"title"),type=value(d,"follow_up_type") as FollowUpType,due=value(d,"due_at");if(!customerId||!title||!due||!followTypes.has(type))throw new Error("Title, type and due date are required.");const id=value(d,"follow_up_id");const payload={customer_id:customerId,title:title.slice(0,200),details:value(d,"details")||null,follow_up_type:type,due_at:new Date(due).toISOString(),updated_at:new Date().toISOString()};const result=id?await supabase.from("crm_follow_ups").update(payload).eq("id",id):await supabase.from("crm_follow_ups").insert({...payload,status:"pending",created_by:user.id});if(result.error)throw new Error(result.error.message);revalidatePath(path(customerId));revalidatePath("/admin/crm/follow-ups"); }
export async function updateFollowUpStatus(d:FormData) { const {supabase}=await admin();const id=value(d,"follow_up_id"),customerId=value(d,"customer_id"),status=value(d,"status") as FollowUpStatus;if(!followStatuses.has(status))throw new Error("Invalid follow-up status.");const {error}=await supabase.from("crm_follow_ups").update({status,completed_at:status==="completed"?new Date().toISOString():null,updated_at:new Date().toISOString()}).eq("id",id);if(error)throw new Error(error.message);revalidatePath(path(customerId));revalidatePath("/admin/crm/follow-ups"); }

const automationPaths = ["/admin/crm", "/admin/crm/customers", "/admin/crm/follow-ups", "/admin/crm/automations"];
function refreshAutomation() { automationPaths.forEach(route => revalidatePath(route)); }
export async function saveAutomationSettings(input: { enabled: boolean; newCustomerDays: number; atRiskDays: number; inactiveDays: number; highValuePercentile: number; vipPercentile: number; vipMinOrders: number; retention: boolean; support: boolean; refill: boolean }) {
  const { supabase } = await admin();
  const { enabled, newCustomerDays, atRiskDays, inactiveDays, highValuePercentile, vipPercentile, vipMinOrders, retention, support, refill } = input;
  if (!Number.isInteger(newCustomerDays) || newCustomerDays < 1 || newCustomerDays > 90) throw new Error("New customer window must be between 1 and 90 days.");
  if (!Number.isInteger(atRiskDays) || atRiskDays < 7 || atRiskDays > 365) throw new Error("At risk period must be between 7 and 365 days.");
  if (!Number.isInteger(inactiveDays) || inactiveDays < 14 || inactiveDays > 730) throw new Error("Inactive period must be between 14 and 730 days.");
  if (!(newCustomerDays < atRiskDays && atRiskDays < inactiveDays)) throw new Error("Use increasing windows: New Customer, At Risk, then Inactive.");
  if (![.8, .85, .9, .95].includes(highValuePercentile) || ![.8, .85, .9, .95].includes(vipPercentile) || highValuePercentile >= vipPercentile) throw new Error("VIP must be a smaller top segment than High Value.");
  if (!Number.isInteger(vipMinOrders) || vipMinOrders < 1 || vipMinOrders > 100) throw new Error("VIP minimum orders must be between 1 and 100.");
  const { error } = await supabase.from("crm_automation_settings").update({ enabled, new_customer_days: newCustomerDays, at_risk_days: atRiskDays, inactive_days: inactiveDays, high_value_percentile: highValuePercentile, vip_percentile: vipPercentile, vip_min_orders: vipMinOrders, create_retention_followups: retention, create_support_followups: support, create_refill_followups: refill, updated_at: new Date().toISOString() }).not("id", "is", null);
  if (error) throw new Error("Automation settings could not be saved."); refreshAutomation();
}
export async function runCrmAutomation() {
  const { supabase } = await admin(); const { data, error } = await supabase.rpc("admin_run_crm_automation");
  if (error) throw new Error("Automation could not be started. Please try again.");
  const runId = typeof data === "string" ? data : null;
  const { data: run } = runId ? await supabase.from("crm_automation_runs").select("status,customers_scanned,tags_added,followups_created").eq("id", runId).maybeSingle() : { data: null };
  refreshAutomation(); return run;
}
