export type WebsiteEnquiryCategory = "order" | "payment" | "guidance" | "account" | "general" | "bulk";
const CATEGORIES = new Set<WebsiteEnquiryCategory>(["order", "payment", "guidance", "account", "general", "bulk"]);

export function websiteEnquiryCategory(raw: unknown, service: string): WebsiteEnquiryCategory {
  if (service.toLowerCase() === "partnership enquiry") return "bulk";
  return typeof raw === "string" && CATEGORIES.has(raw as WebsiteEnquiryCategory)
    ? raw as WebsiteEnquiryCategory
    : "general";
}

/** Referral params are self-reported; strip unapproved keys and control characters. */
export function websiteEnquirySource(raw: string) {
  try {
    const url = new URL(raw, "https://www.getsocialrush.com");
    if (url.pathname !== "/contact") return "/contact";
    const params = new URLSearchParams();
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
      const clean = (url.searchParams.get(key) || "").trim().replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 50);
      if (clean) params.set(key, clean);
    }
    const tracked = params.toString();
    return tracked ? ("/contact?" + tracked).slice(0, 200) : "/contact";
  } catch {
    return "/contact";
  }
}

/** Conservative, deterministic first draft; never follows instructions inside untrusted messages. */
export function websiteEnquiryReplyDraft(fullName: string, category: WebsiteEnquiryCategory) {
  const firstName = fullName.trim().split(/\s+/)[0]?.replace(/[^\p{L}'-]/gu, "").slice(0, 35) || "there";
  const greeting = "Hi " + firstName + ",\n\n";
  const signoff = "\n\nBest regards,\nSocialRUSH Support";
  const body: Record<WebsiteEnquiryCategory, string> = {
    order: "Thanks for contacting us about your order. We will review the details and update you through the support channel. Please share your order reference if it was not included. Do not share passwords or OTPs.",
    payment: "Thanks for reaching out about your payment. We will check the reference and follow up with the next steps. Please do not share card details, passwords or OTPs.",
    guidance: "Thank you for your enquiry. Could you share your public profile or content link, your goals and the service you are considering? We will explain the available options, limitations and current pricing.",
    account: "Thanks for contacting SocialRUSH. Please tell us what you need help with in your account. Do not share passwords or verification codes.",
    general: "Thanks for getting in touch with SocialRUSH. We have received your enquiry and will review the details before responding.",
    bulk: "Thank you for your interest in working with SocialRUSH. Could you share the type of partnership or campaign, your organisation or public website, expected scope and preferred timeline? We can then review whether there is a suitable fit.",
  };
  return greeting + body[category] + signoff;
}
