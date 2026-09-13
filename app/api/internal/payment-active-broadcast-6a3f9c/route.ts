import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RUN_TOKEN = "AeZkzIb_gI2r1-tHxu0ogAbXJES_aZ7HmnH8DPrC9O4";
const PAGE_SIZE = 25;
const SITE = "https://www.getsocialrush.com";

const esc = (value: unknown) => String(value ?? "").replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character] as string));
const first = (name?: string | null) => (name || "there").trim().split(/\s+/)[0] || "there";

function unsubscribeUrl(userId: string, secret: string) {
  const token = createHmac("sha256", secret).update(userId).digest("base64url");
  return `${SITE}/api/email/unsubscribe?u=${encodeURIComponent(userId)}&t=${encodeURIComponent(token)}`;
}

function message(name: string | null | undefined, userId: string, secret: string) {
  const firstName = first(name);
  const orderUrl = `${SITE}/dashboard/new-order`;
  const unsubscribe = unsubscribeUrl(userId, secret);
  const subject = "Payment Method Is Active — You Can Place Orders Now";
  const text = `Hi ${firstName},\n\nOur payment method is active again on SocialRUSH.\n\nYou can now place your orders directly through your dashboard. Choose your service, enter your order details, complete the payment, and submit your order.\n\nPlace Your Order: ${orderUrl}\n\nThank you for choosing SocialRUSH.\n\nRegards,\nTeam SocialRUSH\n\nYou received this because you opted in to product updates. Unsubscribe: ${unsubscribe}`;
  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#07080D;font-family:Arial,Helvetica,sans-serif;color:#F8FAFC"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#07080D"><tr><td align="center" style="padding:28px 14px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#101219;border:1px solid #252934;border-radius:18px;overflow:hidden"><tr><td style="height:4px;background:#FF7600"></td></tr><tr><td style="padding:28px 32px 20px;background:#0C0E14;border-bottom:1px solid #252934"><img src="https://www.getsocialrush.com/images/brand/socialrush-logo-transparent.png" width="174" alt="SocialRUSH" style="display:block;max-width:100%;height:auto;border:0"></td></tr><tr><td style="padding:34px 32px 10px"><h1 style="margin:0;font-size:28px;line-height:36px;color:#F8FAFC">Payment method is active again</h1></td></tr><tr><td style="padding:10px 32px 0;font-size:16px;line-height:26px;color:#A8AFBD">Hi ${esc(firstName)},<br><br>Our payment method is active again on SocialRUSH. You can now place orders directly through your dashboard. Choose your service, enter your order details, complete the payment, and submit your order.</td></tr><tr><td style="padding:30px 32px 0"><a href="${orderUrl}" style="display:inline-block;padding:14px 22px;border-radius:9px;background:#FF7600;color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none">Place Your Order</a></td></tr><tr><td style="padding:26px 32px 34px;font-size:14px;line-height:23px;color:#A8AFBD">Thank you for choosing SocialRUSH.<br><br>Regards,<br><strong style="color:#F8FAFC">Team SocialRUSH</strong><br><br><a href="${unsubscribe}" style="color:#A8AFBD">Unsubscribe from product updates</a></td></tr></table></td></tr></table></body></html>`;
  return { subject, text, html };
}

export async function GET(request: NextRequest) {
  const provided = request.nextUrl.searchParams.get("token");
  if (provided !== RUN_TOKEN) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const replyTo = process.env.REPLY_TO_EMAIL;
  const unsubscribeSecret = process.env.EMAIL_UNSUBSCRIBE_SECRET;
  if (!resendKey || !from || !replyTo || !unsubscribeSecret) {
    return NextResponse.json({ error: "Email delivery is not fully configured" }, { status: 503 });
  }

  const page = Math.max(0, Number.parseInt(request.nextUrl.searchParams.get("page") || "0", 10) || 0);
  const fromRow = page * PAGE_SIZE;
  const toRow = fromRow + PAGE_SIZE - 1;
  const db = createAdminClient();

  const { data: profiles, error: profileError } = await db
    .from("profiles")
    .select("id,email,full_name,notification_preferences,role")
    .order("id", { ascending: true })
    .range(fromRow, toRow);

  if (profileError) return NextResponse.json({ error: "Could not load recipients" }, { status: 503 });

  const eligible = (profiles || []).filter((profile) => {
    const email = String(profile.email || "").trim();
    const prefs = profile.notification_preferences as { marketing?: boolean } | null;
    return Boolean(email) && profile.role !== "admin" && prefs?.marketing === true && !/(^|[+.])(?:test|internal)(?:[+.@]|$)/i.test(email);
  });

  const emails = eligible.map((profile) => String(profile.email).trim().toLowerCase());
  const suppressed = new Set<string>();
  if (emails.length) {
    const { data: rows, error: suppressionError } = await db
      .from("crm_suppression_list")
      .select("email")
      .in("email", emails);
    if (suppressionError) return NextResponse.json({ error: "Could not check suppression list" }, { status: 503 });
    for (const row of rows || []) suppressed.add(String(row.email || "").trim().toLowerCase());
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < eligible.length; i += 5) {
    const batch = eligible.slice(i, i + 5);
    const results = await Promise.all(batch.map(async (profile) => {
      const email = String(profile.email || "").trim();
      if (suppressed.has(email.toLowerCase())) return "skipped" as const;
      const emailMessage = message(profile.full_name, profile.id, unsubscribeSecret);
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `payment-active-2026-09-13-${profile.id}`,
        },
        body: JSON.stringify({
          from,
          to: [email],
          reply_to: replyTo,
          subject: emailMessage.subject,
          html: emailMessage.html,
          text: emailMessage.text,
        }),
      });
      return response.ok ? "sent" as const : "failed" as const;
    }));
    for (const result of results) {
      if (result === "sent") sent++;
      else if (result === "skipped") skipped++;
      else failed++;
    }
  }

  return NextResponse.json({
    status: "ok",
    page,
    scanned: (profiles || []).length,
    eligible: eligible.length,
    sent,
    skipped,
    failed,
    hasMore: (profiles || []).length === PAGE_SIZE,
  });
}
