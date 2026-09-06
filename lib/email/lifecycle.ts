export type LifecycleProfile = { id:string; email:string|null; created_at:string; notification_preferences?:{marketing?:boolean}|null; role?:string|null };
export type LifecycleOrder = { user_id:string; created_at:string; status:string|null; payment_status?:string|null };
export type LifecycleEvent = "first_order_reminder"|"inactive_7d";

export const qualifyingOrder = (order: Pick<LifecycleOrder,"status"|"payment_status">) =>
  !["cancelled","refunded","failed"].includes(String(order.status||"").toLowerCase()) &&
  !["failed","refunded","cancelled"].includes(String(order.payment_status||"").toLowerCase());

export function lifecycleEligibility(event:LifecycleEvent, profile:LifecycleProfile, orders:LifecycleOrder[], now=new Date(), delayHours=24, inactiveDays=7) {
  if (!profile.email || profile.role === "admin" || /(^|[+.])(?:test|internal)(?:[+.@]|$)/i.test(profile.email) || profile.notification_preferences?.marketing !== true) return false;
  const qualifying=orders.filter(qualifyingOrder).sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at));
  if(event==="first_order_reminder") return qualifying.length===0 && Date.parse(profile.created_at)<=now.getTime()-delayHours*3600000;
  return qualifying.length>0 && Date.parse(qualifying[0].created_at)<=now.getTime()-inactiveDays*86400000;
}

export const lifecycleKey=(event:LifecycleEvent,userId:string,anchor:string)=>`${event}:${userId}:${anchor.slice(0,10)}`;
export const promotionalEvent=(event:string)=>event==="first_order_reminder"||event==="inactive_7d";
export const canSendPromotional=()=>Boolean(process.env.EMAIL_UNSUBSCRIBE_SECRET);
