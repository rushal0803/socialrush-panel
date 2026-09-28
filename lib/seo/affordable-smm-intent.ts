export const affordableSmmIndiaKeywords = [
  "cheap SMM panel India",
  "affordable SMM panel India",
  "low cost SMM panel India",
  "budget SMM panel India",
  "cheap social media services India",
] as const;

export const affordableSmmCriteria = [
  {
    id: "unit-cost",
    title: "Compare the real unit cost",
    text: "Use the current INR rate together with the quantity you actually need. A low headline rate is only useful when the selected service and quantity are available.",
  },
  {
    id: "minimum",
    title: "Check the minimum order",
    text: "A smaller valid minimum can matter more for a test campaign than a low per-1,000 rate that requires a much larger order.",
  },
  {
    id: "terms",
    title: "Include delivery and refill terms",
    text: "Compare the current delivery estimate and any listed refill or support terms alongside price rather than treating price as the only decision factor.",
  },
  {
    id: "checkout",
    title: "Use the final checkout total",
    text: "The live catalog and checkout summary remain authoritative for current availability, quantity validation and the amount due.",
  },
] as const;

export function affordableSmmFaqs() {
  return [
    {
      question: "What should I compare when looking for a cheap SMM panel in India?",
      answer:
        "Compare the current INR rate, valid minimum and maximum quantity, delivery estimate, refill or support terms, and the final checkout total. A low advertised rate alone does not show the full campaign cost.",
    },
    {
      question: "Does SocialRUSH claim to be the cheapest SMM panel in India?",
      answer:
        "No. SocialRUSH publishes current pricing and service details so customers can compare costs for their own campaign. It does not claim a universal cheapest ranking across every service or provider.",
    },
  ] as const;
}
