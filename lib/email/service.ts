import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { firstOrderReminder, inactive7d, orderCompleted, orderCreated, type EmailTemplate } from "@/lib/email/templates";
import { canSendPromotional, lifecycleEligibility, promotionalEvent, recipientMatchesProfile } from "@/lib/email/lifecycle";
type Event={id:string;user_id:string;order_id:string|null;event_type:"signup_no_order"|"order_created"|"order_completed"|"first_order_reminder"|"inactive_7d";recipient:string};
type AdminClient=ReturnType<typeof createAdminClient>;
const safeError=(e:unknown)=>e instanceof Error?e.message.slice(0,500):"Email provider request failed";
async function deliver(recipient:string,message:EmailTemplate,key?:string){const api=process.env.RESEND_API_KEY,from=process.env.EMAIL_FROM,reply=process.env.REPLY_TO_EMAIL;if(!api||!from||!reply)throw new Error("Email delivery is not configured");const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${api}`,"Content-Type":"application/json",...(key?{"Idempotency-Key":key}:{})},body:JSON.stringify({from,to:[recipient],reply_to:reply,subject:message.subject,html:message.html,text:message.text})}),body=await r.json().catch(()=>null) as {id?:string;message?:string}|null;if(!r.ok)throw new Error(`Resend request failed (${r.status}): ${body?.message||"unknown"}`);return body?.id||null;}
const terminal=async(db:AdminClient,id:string,reason:string)=>db.from("customer_email_events").update({status:"sent",sent_at:new Date().toISOString(),processing_started_at:null,error_message:reason}).eq("id",id);
export async function processCustomerEmailEvents(limit=20){
 const db=createAdminClient();const {error:enqueueError}=await db.rpc("enqueue_customer_lifecycle_email_events");if(enqueueError)throw enqueueError;let processed=0;
 for(let i=0;i<limit;i++){
  const {data,error}=await db.rpc("claim_next_customer_email_event");if(error)throw error;const event=(data?.[0]||null) as Event|null;if(!event)break;processed++;
  try{
   if(event.event_type==="signup_no_order"){await terminal(db,event.id,"Skipped: superseded by first_order_reminder");continue;}
   const promotional=promotionalEvent(event.event_type);
   const {data:profile,error:profileError}=await db.from("profiles").select("id,full_name,notification_preferences,role,email,created_at").eq("id",event.user_id).single();
   if(promotional&&profileError)throw new Error("Lifecycle profile eligibility lookup failed");
   if(promotional){
    const [{data:suppression,error:suppressionError},{data:orders,error:ordersError},{data:config,error:configError}]=await Promise.all([
     db.from("crm_suppression_list").select("email").eq("email",event.recipient.trim().toLowerCase()).maybeSingle(),
     db.from("orders").select("user_id,created_at,status,payment_status").eq("user_id",event.user_id),
     db.from("customer_email_automation_config").select("lifecycle_enabled,first_order_delay_hours,inactive_days,lifecycle_activation_at").eq("id",true).single()
    ]);
    if(suppressionError||ordersError||configError||!config)throw new Error("Lifecycle eligibility lookup failed");
    if(!config.lifecycle_enabled){await db.from("customer_email_events").update({status:"queued",processing_started_at:null,error_message:"Deferred: lifecycle disabled"}).eq("id",event.id);break;}
    if(!recipientMatchesProfile(event.recipient,profile?.email)){await terminal(db,event.id,"Skipped: recipient changed");continue;}
    const eligible=profile&&lifecycleEligibility(event.event_type as "first_order_reminder"|"inactive_7d",profile,orders||[],new Date(),config.first_order_delay_hours||24,config.inactive_days||7,config.lifecycle_activation_at);
    if(!eligible||suppression||!canSendPromotional()){await terminal(db,event.id,!canSendPromotional()?"Skipped: unsubscribe secret unavailable":"Skipped: lifecycle ineligible");continue;}
   }
   let template:EmailTemplate;
   if(event.event_type==="first_order_reminder")template=firstOrderReminder(profile?.full_name,event.user_id);else if(event.event_type==="inactive_7d")template=inactive7d(profile?.full_name,event.user_id);else{const {data:order,error:orderError}=await db.from("orders").select("id,public_order_id,platform,service_name,quantity,charge,status,created_at").eq("id",event.order_id!).single();if(orderError||!order)throw new Error("Order details are unavailable");template=event.event_type==="order_created"?orderCreated(profile?.full_name,order):orderCompleted(profile?.full_name,order);}
   const id=await deliver(event.recipient,template,`customer-email-${event.id}`);await db.from("customer_email_events").update({status:"sent",provider_message_id:id,sent_at:new Date().toISOString(),processing_started_at:null}).eq("id",event.id);
  }catch(e){const message=safeError(e),permanent=promotionalEvent(event.event_type)&&/Resend request failed \(4\d\d\)/.test(message);await db.from("customer_email_events").update({status:permanent?"sent":"failed",sent_at:permanent?new Date().toISOString():null,error_message:permanent?`Skipped: permanent provider rejection: ${message}`:message,processing_started_at:null}).eq("id",event.id);console.error("[email] provider failure",{eventId:event.id,eventType:event.event_type,error:message});}
 }
 return processed;
}
export async function sendEmailTest(){if(!canSendPromotional())throw new Error("Promotional email sending requires EMAIL_UNSUBSCRIBE_SECRET.");return deliver("rushalthakur240@gmail.com",firstOrderReminder("Rushal","00000000-0000-0000-0000-000000000000"));}
