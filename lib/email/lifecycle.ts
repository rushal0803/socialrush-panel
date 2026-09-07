export type LifecycleProfile = { id:string; email:string|null; created_at:string; notification_preferences?:{marketing?:boolean}|null; role?:string|null };
export type LifecycleOrder = { user_id:string; created_at:string; status:string|null; payment_status?:string|null; platform?:string|null; charge?:number|string|null };
export type LifecycleEvent = "first_order_reminder"|"inactive_7d";

export const qualifyingOrder = (order: Pick<LifecycleOrder,"status"|"payment_status">) =>
  !["cancelled","refunded","failed"].includes(String(order.status||"").toLowerCase()) &&
  !["failed","refunded","cancelled"].includes(String(order.payment_status||"").toLowerCase());

export function lifecycleEligibility(event:LifecycleEvent, profile:LifecycleProfile, orders:LifecycleOrder[], now=new Date(), delayHours=24, inactiveDays=7, activationAt:string|null|undefined=undefined) {
  if (!profile.email || profile.role === "admin" || /(^|[+.])(?:test|internal)(?:[+.@]|$)/i.test(profile.email) || profile.notification_preferences?.marketing !== true) return false;
  if (activationAt === null) return false;
  const activationTime=activationAt ? Date.parse(activationAt) : Number.NEGATIVE_INFINITY;
  if (activationAt && !Number.isFinite(activationTime)) return false;
  const qualifying=orders.filter(qualifyingOrder).sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at));
  if(event==="first_order_reminder") return Date.parse(profile.created_at)>=activationTime && qualifying.length===0 && Date.parse(profile.created_at)<=now.getTime()-delayHours*3600000;
  return qualifying.length>0 && Date.parse(qualifying[0].created_at)>=activationTime && Date.parse(qualifying[0].created_at)<=now.getTime()-inactiveDays*86400000;
}

export const lifecycleKey=(event:LifecycleEvent,userId:string,anchor:string)=>`${event}:${userId}:${anchor.slice(0,10)}`;
export const promotionalEvent=(event:string)=>event==="first_order_reminder"||event==="inactive_7d";
export const canSendPromotional=()=>Boolean(process.env.EMAIL_UNSUBSCRIBE_SECRET);
export const recipientMatchesProfile=(recipient:string, profileEmail:string|null|undefined)=>recipient.trim().toLowerCase()===String(profileEmail||"").trim().toLowerCase();

export type LifecyclePlatform="Instagram"|"YouTube"|"LinkedIn"|"Facebook"|"Twitter/X"|"Telegram"|"TikTok";
export type InactiveEmailKind="vip"|"high_value"|"generic"|LifecyclePlatform;
export type CrmEmailContext={lifecycle_stage?:string|null;tags?:Array<string|null|undefined>};

export function normalizeLifecyclePlatform(value:string|null|undefined):LifecyclePlatform|undefined {
 const platform=String(value||"").trim().toLowerCase().replace(/[\s_-]+/g,"");
 if(platform.includes("instagram"))return "Instagram";
 if(platform.includes("youtube"))return "YouTube";
 if(platform.includes("linkedin"))return "LinkedIn";
 if(platform.includes("facebook"))return "Facebook";
 if(platform==="x"||platform.includes("twitter"))return "Twitter/X";
 if(platform.includes("telegram"))return "Telegram";
 if(platform.includes("tiktok"))return "TikTok";
 return undefined;
}
export function lifecycleOrderSummary(orders:LifecycleOrder[]){
 const valid=orders.filter(qualifyingOrder), counts=new Map<LifecyclePlatform,number>();
 for(const order of valid){const platform=normalizeLifecyclePlatform(order.platform);if(platform)counts.set(platform,(counts.get(platform)||0)+1);}
 const recent=[...valid].sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at)).find(order=>normalizeLifecyclePlatform(order.platform));
 const top=[...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0]?.[0];
 return {validOrders:valid.length,totalSpend:valid.reduce((sum,order)=>sum+Number(order.charge||0),0),recentPlatform:normalizeLifecyclePlatform(recent?.platform),topPlatform:top};
}
const hasTag=(context:CrmEmailContext,name:string)=>context.tags?.some(tag=>String(tag||"").trim().toLowerCase()===name.toLowerCase())===true;
export function inactiveEmailKind(context:CrmEmailContext,orders:LifecycleOrder[]):InactiveEmailKind {
 if(String(context.lifecycle_stage||"").toLowerCase()==="vip"||hasTag(context,"VIP"))return "vip";
 if(hasTag(context,"High Value"))return "high_value";
 const summary=lifecycleOrderSummary(orders);
 return summary.recentPlatform||summary.topPlatform||"generic";
}
export const hasUnresolvedSupport=(tickets:Array<{status?:string|null}>)=>tickets.some(ticket=>!["resolved","closed"].includes(String(ticket.status||"").toLowerCase()));
export const hasActiveRefill=(requests:Array<{status?:string|null}>)=>requests.some(request=>!["completed","rejected","cancelled"].includes(String(request.status||"").toLowerCase()));
