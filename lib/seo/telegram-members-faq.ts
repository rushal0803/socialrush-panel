/** One source for visible buyer answers and their JSON-LD; no fixed live rates. */
export const telegramMembersFaqs = [
  ["How do I order Telegram members in India?", "Choose a member quantity, enter the correct public Telegram channel or group link, review the live INR total, and continue through the secure SocialRUSH order flow."],
  ["Do I need to share my Telegram password?", "No. SocialRUSH only needs the public Telegram channel or group URL required by the service. Never share a password, OTP, phone login, or recovery code."],
  ["Can I order for a Telegram channel or group?", "Yes, when the destination is a valid public Telegram channel or group link supported by the service. Check that the link opens correctly before ordering."],
  ["How do I track my order?", "Once your order is placed, its status and details remain available in your SocialRUSH dashboard."],
  ["How long does delivery take?", "The current delivery estimate is displayed alongside the active service before you continue to checkout. Timing can vary by quantity and link availability."],
  ["What happens if my link is private or incorrect?", "A private, inaccessible, or incorrect link may prevent the order from being processed. Confirm the public destination before submitting it, then contact support with your order ID if you need help."],
  ["Is refill or support available?", "The current refill or support information is displayed with the active service. Check the service details before placing your order because eligibility can vary."],
  ["Are Telegram members guaranteed to be from India?", "No. INR pricing and ordering from India do not guarantee Indian members, language, location or a relevant audience. Review the selected service terms before ordering."],
  ["Do purchased members guarantee an active Telegram community?", "No. Member counts do not prove authentic interest or guarantee post views, replies, retention, customers or revenue. Telegram may restrict spam or fake activity. Measure post views and useful conversations separately, and review Telegram's terms before using a third-party service."],
] as const;

export function telegramMembersFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: telegramMembersFaqs.map(([name, text]) => ({
      "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text },
    })),
  };
}
