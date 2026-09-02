export type LifecycleStage = "lead" | "new_customer" | "active" | "vip" | "at_risk" | "inactive";
export type CrmPriority = "low" | "normal" | "high";
export type FollowUpType = "general" | "sales" | "support" | "payment" | "refill" | "retention";
export type FollowUpStatus = "pending" | "completed" | "cancelled";

export type LeadStatus = "new" | "researching" | "ready" | "contacted" | "replied" | "qualified" | "won" | "lost" | "do_not_contact";
export type LeadCompanyType = "business" | "creator" | "startup" | "agency" | "other";
export type CRMLead = { id:string; business_name:string; domain:string|null; website_url:string|null; country:string|null; city:string|null; industry:string|null; company_type:LeadCompanyType; employee_range:string|null; instagram_url:string|null; linkedin_url:string|null; youtube_url:string|null; tiktok_url:string|null; source:string|null; source_name:string|null; source_url:string|null; status:LeadStatus; priority:CrmPriority; score:number|null; fit_summary:string|null; recommended_service:string|null; last_contacted_at:string|null; next_action_at:string|null; discovered_at:string|null; created_by:string|null; created_at:string; updated_at:string };
export type CRMInboundMessage = { id:string; thread_id:string; lead_id:string|null; contact_id:string|null; from_email:string; subject:string|null; body_text:string; received_at:string; classification:string|null; confidence:number|null; needs_admin_review:boolean; admin_classification:string|null; suggested_reply_draft:string|null; draft_status:"draft"|"approved"|"discarded"|null };
export type ReplyClassification = "interested"|"needs_information"|"not_now"|"meeting_request"|"positive_reply"|"negative_reply"|"unsubscribe"|"out_of_office"|"bounce"|"wrong_person"|"other";
export type CRMReplyAutomationSettings = { id:boolean; reply_detection_enabled:boolean; auto_classify_replies:boolean; auto_stop_sequence_on_reply:boolean; auto_suppress_unsubscribes:boolean; create_reply_followups:boolean; generate_ai_reply_drafts:boolean; updated_at:string };
export type CRMLeadContact = { id:string; lead_id:string; full_name:string; job_title:string|null; email:string; email_type:"business"|"generic"|"personal"|"unknown"; verification_status:"unverified"|"valid"|"risky"|"invalid"; compliance_status:"eligible"|"review"|"blocked"; contact_basis:"public_business_contact"|"existing_relationship"|"consent"|"other"; is_primary:boolean; source_url:string|null; discovered_at:string|null; opted_out_at:string|null; created_at:string; updated_at:string };
export type CRMOutreachSequence = { id:string; name:string; description:string|null; status:"draft"|"active"|"paused"|"archived"; daily_send_limit:number|null; timezone:string|null; send_window_start:string|null; send_window_end:string|null; created_by:string|null; created_at:string; updated_at:string };
export type CRMOutreachSequenceStep = { id:string; sequence_id:string; step_number:number; delay_days:number; subject_template:string; body_template:string; stop_on_reply:boolean; created_at:string; updated_at:string };
export type CRMLeadEnrollment = { id:string; lead_id:string; contact_id:string; sequence_id:string; status:"active"|"paused"|"completed"|"replied"|"opted_out"|"bounced"|"failed"; current_step:number; next_send_at:string|null; last_sent_at:string|null; created_at:string; updated_at:string };
export type CRMOutreachMessage = { id:string; enrollment_id:string|null; lead_id:string; contact_id:string|null; sequence_id:string|null; step_number:number|null; direction:"outbound"|"inbound"; subject:string|null; body:string|null; status:"draft"|"queued"|"sending"|"sent"|"delivered"|"replied"|"bounced"|"failed"|"skipped"|"cancelled"; provider:string|null; provider_message_id:string|null; scheduled_at:string|null; sent_at:string|null; delivered_at:string|null; replied_at:string|null; error_message:string|null; created_at:string; updated_at:string };
export type CRMSuppressionEntry = { id:string; email:string; reason:"opt_out"|"bounce"|"complaint"|"invalid"|"manual"; source:string|null; notes:string|null; created_at:string };
export type CRMLeadActivity = { id:string; lead_id:string; activity_type:"discovered"|"scored"|"status_changed"|"contact_added"|"outreach_queued"|"outreach_sent"|"reply_received"|"qualified"|"note"|"opt_out"; details: unknown; created_by:string|null; created_at:string };
export type CRMOutreachSettings = { id:string; enabled:boolean; auto_send:boolean; require_verified_business_email:boolean; require_compliance_eligible:boolean; global_daily_send_limit:number; from_name:string|null; from_email:string|null; reply_to:string|null; provider:string|null; default_timezone:string|null; updated_at:string };

export type CrmAutomationSettings = {
  id: string; enabled: boolean; new_customer_days: number; at_risk_days: number; inactive_days: number;
  high_value_percentile: number; vip_percentile: number; vip_min_orders: number;
  create_retention_followups: boolean; create_support_followups: boolean; create_refill_followups: boolean; updated_at: string | null;
};
export type AutomationRunStatus = "running" | "completed" | "failed";
export type AutomationRunDetails = { high_value_threshold?: number; vip_threshold?: number; new_customer_days?: number; at_risk_days?: number; inactive_days?: number };
export type CrmAutomationRun = {
  id: string; started_at: string; completed_at: string | null; status: AutomationRunStatus;
  customers_scanned: number; profiles_touched: number; tags_removed: number; tags_added: number;
  followups_created: number; error_message: string | null; details: AutomationRunDetails | null;
};

export type CustomerMetric = {
  totalOrders: number; validOrders: number; totalSpend: number; averageOrderValue: number;
  firstOrderAt: string | null; lastOrderAt: string | null; topPlatform: string | null;
};

export const validOrder = (order: { status?: string | null; payment_status?: string | null }) =>
  !["cancelled", "refunded", "failed"].includes((order.status || "").toLowerCase()) &&
  !["failed", "refunded"].includes((order.payment_status || "").toLowerCase());

export function metricsForOrders(orders: Array<{ charge?: number | string | null; status?: string | null; payment_status?: string | null; created_at?: string | null; platform?: string | null }>): CustomerMetric {
  const valid = orders.filter(validOrder);
  const sorted = [...orders].sort((a, b) => Date.parse(b.created_at || "") - Date.parse(a.created_at || ""));
  const platforms = new Map<string, number>();
  valid.forEach((order) => order.platform && platforms.set(order.platform, (platforms.get(order.platform) || 0) + 1));
  const topPlatform = [...platforms.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const totalSpend = valid.reduce((sum, order) => sum + Number(order.charge || 0), 0);
  return { totalOrders: orders.length, validOrders: valid.length, totalSpend, averageOrderValue: valid.length ? totalSpend / valid.length : 0, firstOrderAt: sorted.at(-1)?.created_at || null, lastOrderAt: sorted[0]?.created_at || null, topPlatform };
}

export const money = (value: number | string | null | undefined) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
export const date = (value?: string | null) => value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "—";
export const dateTime = (value?: string | null) => value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
