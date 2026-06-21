import "server-only";

export type EmailMessage = { to: string; subject: string; text: string; html?: string };

export async function sendEmail(message: EmailMessage) {
  // Provider-neutral MVP. Replace this body with Resend, SES, Postmark, etc.
  if (process.env.NODE_ENV !== "production") console.info(`[email:prepared] ${message.subject} -> ${message.to}`);
  return { accepted: true, delivered: false, provider: "local-placeholder" as const };
}

export const emailNotifications = {
  orderCreated(to: string, orderId: string) { return sendEmail({ to, subject: `SocialRUSH order ${orderId} created`, text: `Your order ${orderId} was created successfully. Track its progress from Campaign History.` }); },
  orderCompleted(to: string, orderId: string) { return sendEmail({ to, subject: `SocialRUSH order ${orderId} completed`, text: `Your order ${orderId} is now complete. Sign in to review the campaign details.` }); },
  walletCredited(to: string, amount: number) { return sendEmail({ to, subject: "SocialRUSH wallet credited", text: `Your wallet was credited with ₹${amount.toLocaleString("en-IN")}.` }); },
  supportReply(to: string, ticketId: string) { return sendEmail({ to, subject: `New reply on support ticket ${ticketId}`, text: `The SocialRUSH support team replied to ticket ${ticketId}. Sign in to view the conversation.` }); },
};
