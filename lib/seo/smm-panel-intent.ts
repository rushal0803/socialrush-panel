export const smmPanelIndiaKeywords = [
  "SMM panel India",
  "social media panel India",
  "SMM services India",
  "UPI SMM panel India",
  "SMM panel for agencies India",
  "social media growth panel India",
] as const;

export const smmPanelIndiaCriteria = [
  {
    id: "pricing",
    title: "Pricing and quantity limits",
    description:
      "Compare the current rate, minimum and maximum quantity, and the exact order total before paying.",
  },
  {
    id: "payments",
    title: "India-friendly payments",
    description:
      "Check which payment methods are actually available at checkout, including INR-friendly options such as UPI or bank transfer where shown.",
  },
  {
    id: "requirements",
    title: "Public-link requirements",
    description:
      "A clear service should state the exact public profile, post, video, page, channel or group link needed without asking for a social-media password.",
  },
  {
    id: "delivery",
    title: "Delivery, refill and tracking",
    description:
      "Review the current delivery estimate, refill/support terms and how order progress is tracked after checkout.",
  },
] as const;

export function smmPanelPlatformSummary(platformCounts: Record<string, number>) {
  return Object.entries(platformCounts)
    .filter(([, count]) => Number.isFinite(count) && count > 0)
    .map(([platform, count]) => ({ platform, count }))
    .sort((left, right) => right.count - left.count || left.platform.localeCompare(right.platform));
}
