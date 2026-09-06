export type EmailTemplate = { subject: string; html: string; text: string };
import { createHmac } from "crypto";

type Order = { id: string; public_order_id?: string | null; platform?: string | null; service_name?: string | null; quantity?: number | null; charge?: number | null; status?: string | null; created_at?: string | null };
type FrameOptions = { preheader: string; headline: string; body: string; card?: string; cta: string; href: string; support: string };

const site = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://www.getsocialrush.com").replace(/\/$/, "");
const esc = (value: unknown) => String(value ?? "—").replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character] as string));
const first = (name?: string | null) => (name || "there").trim().split(/\s+/)[0] || "there";
const orderId = (order: Order) => order.public_order_id || order.id;
const amount = (value?: number | null) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0));
const orderDate = (value?: string | null) => { const date = value ? new Date(value) : null; return date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date) : "—"; };

function frame({ preheader, headline, body, card, cta, href, support }: FrameOptions) {
  const home = site();
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#07080D;color:#F8FAFC;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#07080D;opacity:0;">${preheader}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#07080D;"><tr><td align="center" style="padding:28px 14px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;background:#101219;border:1px solid #252934;border-radius:18px;overflow:hidden;">
<tr><td style="height:4px;line-height:4px;font-size:0;background:#FF7600;background:linear-gradient(135deg,#FF6200 0%,#FF9A00 100%);">&nbsp;</td></tr>
<tr><td style="padding:28px 32px 20px;background:#0C0E14;border-bottom:1px solid #252934;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td valign="middle"><img src="https://www.getsocialrush.com/images/brand/socialrush-logo-transparent.png" width="174" alt="SocialRUSH" style="display:block;width:174px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;"></td></tr></table></td></tr>
<tr><td style="padding:34px 32px 10px;"><h1 style="margin:0;color:#F8FAFC;font-size:29px;line-height:37px;font-weight:700;letter-spacing:-.4px;">${headline}</h1></td></tr>
<tr><td style="padding:10px 32px 0;font-size:16px;line-height:26px;color:#A8AFBD;">${body}</td></tr>
${card ? `<tr><td style="padding:26px 32px 0;">${card}</td></tr>` : ""}
<tr><td style="padding:30px 32px 0;"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td align="center" style="border-radius:9px;background:#FF7600;background:linear-gradient(135deg,#FF6200 0%,#FF9A00 100%);"><a href="${href}" style="display:inline-block;padding:14px 22px;border-radius:9px;color:#FFFFFF;font-size:15px;line-height:20px;font-weight:700;text-decoration:none;">${cta}</a></td></tr></table></td></tr>
<tr><td style="padding:26px 32px 34px;font-size:14px;line-height:23px;color:#A8AFBD;">${support}</td></tr>
<tr><td style="padding:24px 32px;background:#0C0E14;border-top:1px solid #252934;"><p style="margin:0 0 5px;color:#F8FAFC;font-size:14px;line-height:20px;font-weight:700;">SocialRUSH</p><p style="margin:0 0 14px;color:#747B89;font-size:13px;line-height:20px;">Social growth, simplified.</p><p style="margin:0 0 14px;font-size:13px;line-height:20px;"><a href="${home}" style="color:#FF9A2E;text-decoration:none;">getsocialrush.com</a></p><p style="margin:0;color:#747B89;font-size:12px;line-height:18px;">This is an account/service communication from SocialRUSH.</p></td></tr>
</table></td></tr></table></body></html>`;
}

function details(order: Order) {
  const row = (label: string, value: string, last = false) => `<tr><td style="padding:11px 0${last ? "" : ";border-bottom:1px solid #252934"};width:38%;font-size:12px;line-height:18px;color:#747B89;">${label}</td><td align="right" style="padding:11px 0${last ? "" : ";border-bottom:1px solid #252934"};font-size:13px;line-height:18px;font-weight:700;color:#F8FAFC;">${value}</td></tr>`;
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#0C0E14;border:1px solid #2A2E39;border-radius:13px;"><tr><td style="padding:20px 20px 5px;color:#F8FAFC;font-size:14px;line-height:20px;font-weight:700;">Order details</td></tr><tr><td style="padding:0 20px 10px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${row("Order ID", esc(orderId(order)))}${row("Platform", esc(order.platform))}${row("Service", esc(order.service_name))}${row("Quantity", esc(order.quantity))}${row("Amount", esc(amount(order.charge)))}${row("Status", esc(order.status))}${row("Order date", esc(orderDate(order.created_at)), true)}</table></td></tr></table>`;
}

export function signupNoOrder(name?: string | null): EmailTemplate {
  const url = `${site()}/dashboard/new-order`;
  return { subject: "Your SocialRUSH account is ready — start your first campaign", html: frame({ preheader: "Your SocialRUSH account is ready. Choose a service and launch your first campaign.", headline: `Hi ${esc(first(name))}, your next campaign starts here.`, body: "Your SocialRUSH account is set up and ready to use. Choose the service that matches your growth goal, review the details, and place your first order in a few simple steps.", card: `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#0C0E14;border:1px solid #2A2E39;border-radius:13px;"><tr><td style="padding:20px;"><p style="margin:0 0 8px;color:#F8FAFC;font-size:15px;line-height:22px;font-weight:700;">Built for a straightforward experience</p><p style="margin:0;color:#A8AFBD;font-size:14px;line-height:22px;">Explore services, see pricing before you order, and track your order status from your SocialRUSH dashboard.</p></td></tr></table>`, cta: "Start Your First Order", href: url, support: "Not sure which service is right for you? Reply to this email and we’ll help you choose the best option for your goal." }), text: `Hi ${first(name)}, your next campaign starts here.\n\nYour SocialRUSH account is set up and ready to use. Choose the service that matches your growth goal, review the details, and place your first order in a few simple steps.\n\nBuilt for a straightforward experience: explore services, see pricing before you order, and track your order status from your dashboard.\n\nStart your first order: ${url}\n\nNot sure which service is right for you? Reply to this email and we’ll help you choose the best option for your goal.` };
}

function lifecycleUnsubscribe(userId:string) { const base=site(), secret=process.env.EMAIL_UNSUBSCRIBE_SECRET; if(!secret) return `${base}/dashboard/settings`; const token=createHmac("sha256",secret).update(userId).digest("base64url"); return `${base}/api/email/unsubscribe?u=${encodeURIComponent(userId)}&t=${encodeURIComponent(token)}`; }
export function firstOrderReminder(name?:string|null,userId?:string):EmailTemplate {
  const url=`${site()}/dashboard/new-order`, unsubscribe=userId?lifecycleUnsubscribe(userId):`${site()}/dashboard/settings`;
  const body=`Hi ${first(name)},\n\nYour SocialRUSH account is ready when you are. Choose a platform and service, enter the quantity and public link, then review your order before confirming it.\n\nPlace an order: ${url}\n\nNeed a hand? Visit ${site()}/dashboard/support\n\nYou received this because you opted in to product updates. Unsubscribe: ${unsubscribe}`;
  return {subject:"Ready to place your first SocialRUSH order?",html:frame({preheader:"A simple way to start your first SocialRUSH order.",headline:`Ready when you are, ${esc(first(name))}.`,body:"Choose a platform and service, enter the quantity and public link, then review your order before confirming it.",cta:"Start a New Order",href:url,support:`Need help? Visit <a href="${site()}/dashboard/support" style="color:#FF9A2E">Support</a>.<br><br><a href="${unsubscribe}" style="color:#A8AFBD">Unsubscribe from product updates</a>.`}),text:body};
}
export function inactive7d(name?:string|null,userId?:string):EmailTemplate {
  const url=`${site()}/dashboard/orders`,unsubscribe=userId?lifecycleUnsubscribe(userId):`${site()}/dashboard/settings`;
  const body=`Hi ${first(name)},\n\nReady for your next SocialRUSH campaign? Your dashboard keeps your order history in one place, and you can start a new order whenever it suits you.\n\nView your orders: ${url}\n\nNeed help? Visit ${site()}/dashboard/support\n\nYou received this because you opted in to product updates. Unsubscribe: ${unsubscribe}`;
  return {subject:"Ready for your next SocialRUSH campaign?",html:frame({preheader:"Return to your dashboard when you are ready.",headline:`Welcome back, ${esc(first(name))}.`,body:"Your dashboard keeps your order history in one place, and you can start a new order whenever it suits you.",cta:"View My Orders",href:url,support:`Need help? Visit <a href="${site()}/dashboard/support" style="color:#FF9A2E">Support</a>.<br><br><a href="${unsubscribe}" style="color:#A8AFBD">Unsubscribe from product updates</a>.`}),text:body};
}

export function orderCreated(name: string | null | undefined, order: Order): EmailTemplate {
  const url = `${site()}/dashboard/orders/${order.id}`;
  return { subject: `Order received — SocialRUSH ${orderId(order)}`, html: frame({ preheader: `Your SocialRUSH order ${esc(orderId(order))} has been received.`, headline: `Thanks, ${esc(first(name))}. Your order is confirmed.`, body: "We’ve successfully received your order and it is now in our system. You can review the order details and follow its progress from your dashboard.", card: details(order), cta: "Track Your Order", href: url, support: `If anything looks incorrect or you need assistance, reply to this email and include your order ID (${esc(orderId(order))}) so our team can help quickly.` }), text: `Thanks, ${first(name)}. Your order is confirmed.\n\nWe’ve successfully received your order and it is now in our system.\n\nOrder ID: ${orderId(order)}\nPlatform: ${order.platform || "—"}\nService: ${order.service_name || "—"}\nQuantity: ${order.quantity ?? "—"}\nAmount: ${amount(order.charge)}\nStatus: ${order.status || "—"}\nOrder date: ${orderDate(order.created_at)}\n\nTrack your order: ${url}\n\nIf anything looks incorrect or you need assistance, reply to this email and include your order ID so our team can help quickly.` };
}

export function orderCompleted(name: string | null | undefined, order: Order): EmailTemplate {
  const url = `${site()}/dashboard/orders`;
  return { subject: `Order completed — SocialRUSH ${orderId(order)}`, html: frame({ preheader: `Your SocialRUSH order ${esc(orderId(order))} is complete.`, headline: `Your order is complete, ${esc(first(name))}.`, body: "Your SocialRUSH order has been marked as completed. Thank you for choosing us to support your social media growth.", card: details(order), cta: "View My Orders", href: url, support: "Have a question about this order or need help with your next campaign? Reply to this email and our team will be happy to assist." }), text: `Your order is complete, ${first(name)}.\n\nYour SocialRUSH order has been marked as completed. Thank you for choosing us to support your social media growth.\n\nOrder ID: ${orderId(order)}\nPlatform: ${order.platform || "—"}\nService: ${order.service_name || "—"}\nQuantity: ${order.quantity ?? "—"}\nAmount: ${amount(order.charge)}\nStatus: ${order.status || "—"}\nOrder date: ${orderDate(order.created_at)}\n\nView your orders: ${url}\n\nHave a question about this order or need help with your next campaign? Reply to this email and our team will be happy to assist.` };
}
