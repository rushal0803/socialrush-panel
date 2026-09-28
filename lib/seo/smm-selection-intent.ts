export const smmSelectionIndiaKeywords = [
  "reliable social media growth services India",
  "trusted social media growth services India",
  "best social media growth platform India",
  "reliable social media services India",
  "social media growth service comparison India",
] as const;

export const smmSelectionCriteria = [
  {
    id: "pricing",
    title: "Transparent INR pricing",
    description:
      "Compare the current per-service rate, minimum quantity and exact order total instead of relying on a promotional headline price.",
  },
  {
    id: "payments",
    title: "India-friendly checkout",
    description:
      "Check which payment methods are actually available at checkout, including UPI or bank transfer where shown.",
  },
  {
    id: "requirements",
    title: "Public-link ordering",
    description:
      "A clear service should state the exact public profile, post, video, page, channel or group link required and should not ask for a social-media password.",
  },
  {
    id: "delivery",
    title: "Delivery and refill terms",
    description:
      "Review the current delivery estimate and refill or support terms for the exact service before ordering.",
  },
  {
    id: "tracking",
    title: "Order tracking and support",
    description:
      "Use a provider that exposes order status and a support path instead of leaving delivery and payment status unclear.",
  },
] as const;

export function smmSelectionChecklist() {
  return smmSelectionCriteria.map(({ id, title }) => ({ id, title }));
}
