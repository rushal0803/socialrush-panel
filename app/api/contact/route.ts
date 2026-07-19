import { NextResponse } from "next/server";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function cleanText(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const current = rateLimit.get(ip);

  if (!current || current.resetAt <= now) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  current.count += 1;
  rateLimit.set(ip, current);
  return current.count > MAX_REQUESTS;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many enquiries were sent recently. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  let payload: Record<string, unknown>;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid enquiry payload." }, { status: 400 });
  }

  const honeypot = cleanText(payload.website, 200);
  if (honeypot) {
    return NextResponse.json({ message: "Thanks. Your enquiry has been received." });
  }

  const name = cleanText(payload.name, 100);
  const email = cleanText(payload.email, 160).toLowerCase();
  const whatsapp = cleanText(payload.whatsapp, 40);
  const service = cleanText(payload.service, 140);
  const message = cleanText(payload.message, 2000);
  const source = cleanText(payload.source, 200) || "/contact";
  const submittedAt = new Date().toISOString();

  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  if (!/^[+\d\s()-]{8,40}$/.test(whatsapp)) {
    return NextResponse.json({ error: "Please enter a valid WhatsApp number." }, { status: 400 });
  }

  if (!service) {
    return NextResponse.json({ error: "Please select a service." }, { status: 400 });
  }

  if (message.length < 10) {
    return NextResponse.json({ error: "Please add a short message about your enquiry." }, { status: 400 });
  }

  const linkCount = message.match(/https?:\/\//gi)?.length ?? 0;
  if (linkCount > 3) {
    return NextResponse.json(
      { error: "Please remove extra links and send a simple enquiry message." },
      { status: 400 },
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const supportEmail = process.env.CONTACT_TO_EMAIL || process.env.SUPPORT_EMAIL || "support@getsocialrush.com";
  const fromEmail = process.env.CONTACT_FROM_EMAIL || "SocialRUSH Website <onboarding@resend.dev>";

  if (!resendApiKey) {
    return NextResponse.json(
      { error: "Contact email is not configured yet. Please use WhatsApp support or try again later." },
      { status: 503 },
    );
  }

  const text = [
    "New SocialRUSH website enquiry",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `WhatsApp: ${whatsapp}`,
    `Service: ${service}`,
    `Submitted: ${submittedAt}`,
    `Source: ${source}`,
    `IP: ${ip}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [supportEmail],
      reply_to: email,
      subject: `New SocialRUSH enquiry: ${service}`,
      text,
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Unable to send your enquiry right now. Please use WhatsApp support or try again later." },
      { status: 502 },
    );
  }

  return NextResponse.json({ message: "Thanks. Your enquiry has been sent to SocialRUSH support." });
}
