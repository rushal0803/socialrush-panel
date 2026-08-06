import "server-only";
import { recordIncident } from "@/lib/monitoring/incidents";

export type EmailMessage = { to: string; subject: string; text: string; html?: string };

type EmailDelivery = {
  accepted: boolean;
  delivered: boolean;
  provider: "resend" | "configuration-missing" | "development-disabled";
  messageId?: string;
  errorCode?: string;
};

export async function sendEmail(message: EmailMessage): Promise<EmailDelivery> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.TRANSACTIONAL_EMAIL_FROM;
  const replyTo = process.env.TRANSACTIONAL_EMAIL_REPLY_TO;
  const allowDevelopmentDelivery = process.env.TRANSACTIONAL_EMAIL_DELIVERY_ENABLED === "true";

  if (process.env.NODE_ENV !== "production" && !allowDevelopmentDelivery) {
    console.info(`[email:skipped] ${message.subject} -> ${message.to.replace(/(^.).*(@.*$)/, "$1***$2")}`);
    return { accepted: false, delivered: false, provider: "development-disabled" };
  }
  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") console.warn("[email:skipped] Resend configuration is missing");
    return { accepted: false, delivered: false, provider: "configuration-missing", errorCode: "configuration_missing" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [message.to], subject: message.subject, text: message.text, ...(message.html ? { html: message.html } : {}), ...(replyTo ? { reply_to: replyTo } : {}) }),
      signal: controller.signal,
      cache: "no-store",
    });
    const payload = await response.json().catch(() => null) as { id?: string; message?: string } | null;
    if (!response.ok) { void recordIncident({ type: "transactional_email_failure", severity: "medium", title: "Transactional email delivery failed", summary: `The email provider returned HTTP ${response.status}.`, source: "email", fingerprint: `email-provider:http-${response.status}`, metadata: { category: "provider_http" } }); return { accepted: false, delivered: false, provider: "resend", errorCode: `http_${response.status}` }; }
    return { accepted: true, delivered: true, provider: "resend", messageId: payload?.id };
  } catch (error) {
    const errorCode = error instanceof Error && error.name === "AbortError" ? "timeout" : "request_failed";
    void recordIncident({ type: "transactional_email_failure", severity: "medium", title: "Transactional email delivery failed", summary: "The email provider request could not be completed.", source: "email", fingerprint: `email-provider:${errorCode}`, metadata: { category: errorCode } });
    return { accepted: false, delivered: false, provider: "resend", errorCode };
  } finally {
    clearTimeout(timeout);
  }
}

export const emailNotifications = {
  orderCreated(to: string, orderId: string) { return sendEmail({ to, subject: `SocialRUSH order ${orderId} created`, text: `Your order ${orderId} was created successfully. Track its progress from Campaign History.` }); },
  orderCompleted(to: string, orderId: string) { return sendEmail({ to, subject: `SocialRUSH order ${orderId} completed`, text: `Your order ${orderId} is now complete. Sign in to review the campaign details.` }); },
  walletCredited(to: string, amount: number) { return sendEmail({ to, subject: "SocialRUSH wallet credited", text: `Your wallet was credited with ₹${amount.toLocaleString("en-IN")}.` }); },
  supportReply(to: string, ticketId: string) { return sendEmail({ to, subject: `New reply on support ticket ${ticketId}`, text: `The SocialRUSH support team replied to ticket ${ticketId}. Sign in to view the conversation.` }); },
};
