import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { abandonedOrderReminder, firstOrderFinal7d, firstOrderNudge2h, firstOrderReminder, firstOrderReminder3d, firstOrderTrust24h, inactive7d, inactivePlatform, inactivePremium, neverOrderedReactivation, orderCompleted, orderCreated, type EmailTemplate, type FirstOrderOffer } from "@/lib/email/templates";
import { canSendPromotional, hasActiveRefill, hasUnresolvedSupport, inactiveEmailKind, lifecycleEligibility, promotionalEvent, recipientMatchesProfile } from "@/lib/email/lifecycle";

type Event={
 id:string;
 user_id:string;
 order_id:string|null;
 event_type:"signup_no_order"|"order_created"|"order_completed"|"first_order_reminder"|"first_order_nudge_2h"|"first_order_trust_24h"|"first_order_reminder_3d"|"first_order_final_7d"|"never_ordered_reactivation"|"abandoned_order_reminder"|"inactive_7d";
 recipient:string;
 provider_message_id:string|null;
 attempt_count:number;
 created_at:string;
};
type LifecycleOrderContext={user_id:string;created_at:string;status:string|null;payment_status:string|null;platform:string|null;charge:number|string|null};
type DraftContext={platform:string;service_code:string;quantity:number;updated_at:string};
type CrmTag={name:string|null};
type CrmTagRow={crm_tags:CrmTag|CrmTag[]|null};
type AdminClient=ReturnType<typeof createAdminClient>;
type EventPatch=Partial<{status:string;provider_message_id:string|null;sent_at:string|null;processing_started_at:string|null;error_message:string|null;updated_at:string}>;
export type CustomerEmailProcessOutcome={id:string;eventType:Event["event_type"];outcome:"sent"|"recovered"|"skipped"|"failed";detail?:string};
export type CustomerEmailProcessResult={processed:number;outcomes:CustomerEmailProcessOutcome[]};

const safeError=(e:unknown)=>e instanceof Error?e.message.slice(0,500):"Email provider request failed";
const transactional=(type:Event["event_type"])=>type==="order_created"||type==="order_completed";
const staleTransactional=(event:Event)=>transactional(event.event_type)&&Date.now()-new Date(event.created_at).getTime()>48*60*60*1000;
const crmTagNames=(rows:CrmTagRow[])=>rows.flatMap(row=>Array.isArray(row.crm_tags)?row.crm_tags.map(tag=>tag.name):row.crm_tags?[row.crm_tags.name]:[]);

async function patchEvent(db:AdminClient,id:string,patch:EventPatch){
 const {error}=await db.from("customer_email_events").update(patch).eq("id",id);
 if(error)throw new Error(`Email event update failed: ${error.message}`);
}

async function deliver(recipient:string,message:EmailTemplate,key?:string){
 const api=process.env.RESEND_API_KEY,from=process.env.EMAIL_FROM,reply=process.env.REPLY_TO_EMAIL;
 if(!api||!from||!reply)throw new Error("Email delivery is not configured");
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),8000);
 try{
  const r=await fetch("https://api.resend.com/emails",{
   method:"POST",
   headers:{Authorization:`Bearer ${api}`,"Content-Type":"application/json",...(key?{"Idempotency-Key":key}:{})},
   body:JSON.stringify({from,to:[recipient],reply_to:reply,subject:message.subject,html:message.html,text:message.text}),
   signal:controller.signal
  });
  const body=await r.json().catch(()=>null) as {id?:string;message?:string}|null;
  if(!r.ok)throw new Error(`Resend request failed (${r.status}): ${body?.message||"unknown"}`);
  return body?.id||null;
 }finally{clearTimeout(timeout);}
}

const terminal=async(db:AdminClient,id:string,reason:string)=>patchEvent(db,id,{status:"sent",sent_at:new Date().toISOString(),processing_started_at:null,error_message:reason,updated_at:new Date().toISOString()});

export async function processCustomerEmailEvents(limit=5):Promise<CustomerEmailProcessResult>{
 const db=createAdminClient();
 const [{error:enqueueError},{error:abandonedEnqueueError}]=await Promise.all([
  db.rpc("enqueue_customer_lifecycle_email_events"),
  db.rpc("enqueue_abandoned_order_email_events")
 ]);
 if(enqueueError)throw enqueueError;
 if(abandonedEnqueueError)throw abandonedEnqueueError;
 const outcomes:CustomerEmailProcessOutcome[]=[];
 let processed=0;

 for(let i=0;i<limit;i++){
  const {data,error}=await db.rpc("claim_next_customer_email_event");
  if(error)throw error;
  const event=(data?.[0]||null) as Event|null;
  if(!event)break;
  processed++;

  try{
   if(event.provider_message_id){
    await terminal(db,event.id,"Recovered: provider had already accepted this email");
    outcomes.push({id:event.id,eventType:event.event_type,outcome:"recovered",detail:"provider_already_accepted"});
    continue;
   }

   if(event.event_type==="signup_no_order"){
    await terminal(db,event.id,"Skipped: superseded by first_order_reminder");
    outcomes.push({id:event.id,eventType:event.event_type,outcome:"skipped",detail:"superseded"});
    continue;
   }

   // Do not surprise customers with transactional notifications that were stuck in the historical outage backlog.
   // New transactional events continue to send normally; only events older than 48 hours are retired as stale.
   if(staleTransactional(event)){
    await terminal(db,event.id,"Skipped: stale backlog event older than 48 hours");
    outcomes.push({id:event.id,eventType:event.event_type,outcome:"skipped",detail:"stale_backlog"});
    continue;
   }

   const promotional=promotionalEvent(event.event_type);
   const {data:profile,error:profileError}=await db.from("profiles").select("id,full_name,notification_preferences,role,email,created_at").eq("id",event.user_id).single();
   if(profileError)throw new Error(promotional?"Lifecycle profile eligibility lookup failed":"Customer profile lookup failed");

   let orders:LifecycleOrderContext[]=[],crm:{lifecycle_stage:string|null}|null=null,tagRows:CrmTagRow[]=[],draft:DraftContext|null=null,offer:FirstOrderOffer|undefined;
   if(promotional){
    const [{data:suppression,error:suppressionError},{data:orderRows,error:ordersError},{data:config,error:configError},{data:tickets,error:ticketsError},{data:refills,error:refillsError},{data:crmRow,error:crmError},{data:crmTagRows,error:tagsError},{data:draftRow,error:draftError},{data:rewardRules,error:rewardError}]=await Promise.all([
     db.from("crm_suppression_list").select("email").eq("email",event.recipient.trim().toLowerCase()).maybeSingle(),
     db.from("orders").select("user_id,created_at,status,payment_status,platform,charge").eq("user_id",event.user_id),
     db.from("customer_email_automation_config").select("lifecycle_enabled,first_order_delay_hours,inactive_days,lifecycle_activation_at,first_order_sequence_activation_at,abandoned_order_enabled,abandoned_order_delay_hours,abandoned_order_max_age_days,abandoned_order_activation_at").eq("id",true).single(),
     db.from("support_tickets").select("status").eq("user_id",event.user_id).not("status","in","(resolved,closed)"),
     db.from("order_refill_requests").select("status").eq("customer_id",event.user_id).not("status","in","(completed,rejected,cancelled)"),
     db.from("crm_customer_profiles").select("lifecycle_stage").eq("customer_id",event.user_id).maybeSingle(),
     db.from("crm_customer_tags").select("crm_tags(name)").eq("customer_id",event.user_id),
     db.from("order_drafts").select("platform,service_code,quantity,updated_at").eq("user_id",event.user_id).maybeSingle(),
     db.from("reward_programme_rules").select("enabled,manual_approval,minimum_order_amount,new_customer_reward").eq("id",true).maybeSingle()
    ]);
    if(suppressionError||ordersError||configError||ticketsError||refillsError||crmError||tagsError||draftError||rewardError||!config)throw new Error("Lifecycle eligibility lookup failed");
    orders=orderRows||[];crm=crmRow;tagRows=crmTagRows||[];draft=(draftRow||null) as DraftContext|null;
    const hasPriorQualifyingOrder=orders.some(order=>!["cancelled","refunded","failed"].includes(String(order.status||"").toLowerCase())&&!["cancelled","refunded","failed"].includes(String(order.payment_status||"paid").toLowerCase()));
    const reward=Number(rewardRules?.new_customer_reward||0),minimum=Number(rewardRules?.minimum_order_amount||0);
    if(!hasPriorQualifyingOrder&&rewardRules?.enabled&&!rewardRules.manual_approval&&reward>0&&minimum>0)offer={reward,minimum};
    if(!config.lifecycle_enabled){
     await patchEvent(db,event.id,{status:"queued",processing_started_at:null,error_message:"Deferred: lifecycle disabled",updated_at:new Date().toISOString()});
     outcomes.push({id:event.id,eventType:event.event_type,outcome:"skipped",detail:"lifecycle_disabled"});
     break;
    }
    if(!recipientMatchesProfile(event.recipient,profile?.email)){
     await terminal(db,event.id,"Skipped: recipient changed");
     outcomes.push({id:event.id,eventType:event.event_type,outcome:"skipped",detail:"recipient_changed"});
     continue;
    }
    if(hasUnresolvedSupport(tickets||[])||hasActiveRefill(refills||[])){
     await terminal(db,event.id,"Skipped: unresolved customer service issue");
     outcomes.push({id:event.id,eventType:event.event_type,outcome:"skipped",detail:"customer_service_issue"});
     continue;
    }
    const isAbandoned=event.event_type==="abandoned_order_reminder";
    const activationBoundary=event.event_type==="inactive_7d"?config.lifecycle_activation_at:isAbandoned?config.abandoned_order_activation_at:config.first_order_sequence_activation_at;
    const draftUpdated=draft?Date.parse(draft.updated_at):Number.NaN;
    const abandonedEligible=Boolean(
      profile &&
      config.abandoned_order_enabled &&
      draft &&
      config.abandoned_order_activation_at &&
      Number.isFinite(draftUpdated) &&
      draftUpdated>=Date.parse(config.abandoned_order_activation_at) &&
      draftUpdated<=Date.now()-(config.abandoned_order_delay_hours||2)*3600000 &&
      draftUpdated>=Date.now()-(config.abandoned_order_max_age_days||7)*86400000 &&
      profile.email &&
      profile.role!=="admin" &&
      profile.notification_preferences?.marketing===true &&
      !orders.some(order=>Date.parse(order.created_at)>=draftUpdated && !["cancelled","refunded","failed"].includes(String(order.status||"").toLowerCase()) && !["cancelled","refunded","failed"].includes(String(order.payment_status||"").toLowerCase()))
    );
    const recentDraft=Boolean(draft && Date.parse(draft.updated_at)>=Date.now()-7*86400000);
    const firstOrderEvent=["first_order_reminder","first_order_nudge_2h","first_order_trust_24h","first_order_reminder_3d","first_order_final_7d"].includes(event.event_type);
    const eligible=isAbandoned
      ? abandonedEligible
      : firstOrderEvent && recentDraft
        ? false
        : profile&&lifecycleEligibility(event.event_type as import("@/lib/email/lifecycle").LifecycleEvent,profile,orders||[],new Date(),config.first_order_delay_hours||24,config.inactive_days||7,activationBoundary);
    if(!eligible||suppression||!canSendPromotional()){
     const reason=!canSendPromotional()?"Skipped: unsubscribe secret unavailable":"Skipped: lifecycle ineligible";
     await terminal(db,event.id,reason);
     outcomes.push({id:event.id,eventType:event.event_type,outcome:"skipped",detail:!canSendPromotional()?"unsubscribe_secret_missing":"lifecycle_ineligible"});
     continue;
    }
   }

   let template:EmailTemplate;
   if(event.event_type==="first_order_reminder"){
    template=firstOrderReminder(profile?.full_name,event.user_id);
   }else if(event.event_type==="first_order_nudge_2h"){
    template=firstOrderNudge2h(profile?.full_name,event.user_id,offer);
   }else if(event.event_type==="first_order_trust_24h"){
    template=firstOrderTrust24h(profile?.full_name,event.user_id,offer);
   }else if(event.event_type==="first_order_reminder_3d"){
    template=firstOrderReminder3d(profile?.full_name,event.user_id,offer);
   }else if(event.event_type==="first_order_final_7d"){
    template=firstOrderFinal7d(profile?.full_name,event.user_id,offer);
   }else if(event.event_type==="never_ordered_reactivation"){
    template=neverOrderedReactivation(profile?.full_name,event.user_id,offer);
   }else if(event.event_type==="abandoned_order_reminder"){
    if(!draft)throw new Error("Saved order draft is unavailable");
    const serviceName=draft.service_code.split("-").map(part=>part?part[0].toUpperCase()+part.slice(1):part).join(" ");
    template=abandonedOrderReminder(profile?.full_name,event.user_id,{platform:draft.platform,serviceName,quantity:draft.quantity},offer);
   }else if(event.event_type==="inactive_7d"){
    const kind=inactiveEmailKind({lifecycle_stage:crm?.lifecycle_stage,tags:crmTagNames(tagRows)},orders);
    template=kind==="vip"||kind==="high_value"?inactivePremium(profile?.full_name,event.user_id,kind):kind==="generic"?inactive7d(profile?.full_name,event.user_id):inactivePlatform(profile?.full_name,event.user_id,kind);
   }else{
    const {data:order,error:orderError}=await db.from("orders").select("id,public_order_id,platform,service_name,quantity,charge,status,created_at").eq("id",event.order_id!).single();
    if(orderError||!order)throw new Error("Order details are unavailable");
    template=event.event_type==="order_created"?orderCreated(profile?.full_name,order):orderCompleted(profile?.full_name,order);
   }

   const id=await deliver(event.recipient,template,`customer-email-${event.id}`);
   await patchEvent(db,event.id,{status:"sent",provider_message_id:id,sent_at:new Date().toISOString(),processing_started_at:null,error_message:null,updated_at:new Date().toISOString()});
   outcomes.push({id:event.id,eventType:event.event_type,outcome:"sent"});
  }catch(e){
   const message=safeError(e);
   const idempotencyConflict=/Resend request failed \(409\):.*idempotency/i.test(message);
   const permanentPromotional=promotionalEvent(event.event_type)&&/Resend request failed \(4\d\d\)/.test(message)&&!/Resend request failed \(429\)/.test(message);
   try{
    if(idempotencyConflict){
     await terminal(db,event.id,"Recovered: Resend idempotency key was already used; duplicate suppressed");
     outcomes.push({id:event.id,eventType:event.event_type,outcome:"recovered",detail:"idempotency_conflict"});
    }else if(permanentPromotional){
     await terminal(db,event.id,`Skipped: permanent provider rejection: ${message}`);
     outcomes.push({id:event.id,eventType:event.event_type,outcome:"skipped",detail:"permanent_provider_rejection"});
    }else{
     await patchEvent(db,event.id,{status:"failed",sent_at:null,error_message:message,processing_started_at:null,updated_at:new Date().toISOString()});
     outcomes.push({id:event.id,eventType:event.event_type,outcome:"failed",detail:message});
    }
   }catch(updateError){
    console.error("[email] event persistence failure",{eventId:event.id,eventType:event.event_type,error:safeError(updateError),originalError:message});
    throw updateError;
   }
   console.error("[email] provider failure",{eventId:event.id,eventType:event.event_type,error:message});
  }
 }
 return {processed,outcomes};
}

export async function sendEmailTest(){
 if(!canSendPromotional())throw new Error("Promotional email sending requires EMAIL_UNSUBSCRIBE_SECRET.");
 return deliver("rushalthakur240@gmail.com",firstOrderReminder("Rushal","00000000-0000-0000-0000-000000000000"));
}
