export const bulkSmmIndiaKeywords = [
  "bulk SMM orders India",
  "bulk SMM services India",
  "bulk social media services India",
  "bulk social media growth services India",
  "agency social media fulfillment India",
  "multi client SMM orders India",
  "bulk Instagram YouTube social media orders India",
] as const;

export const bulkSmmDecisionPoints = [
  {
    id: "scope",
    title: "Separate the requirement by client and destination",
    text: "Keep each public profile, page, channel or content URL attached to the correct client so larger requirements do not become one ambiguous order.",
  },
  {
    id: "price",
    title: "Review current catalog pricing before quoting",
    text: "Use the active SocialRUSH catalog and planner estimate for internal planning, then confirm the final payable total in the normal order flow.",
  },
  {
    id: "delivery",
    title: "Check delivery and refill terms per service",
    text: "Different services can have different delivery windows, quantity limits and refill/support terms. Treat each selected service as its own operational line item.",
  },
  {
    id: "control",
    title: "Keep human review before payment",
    text: "The bulk workflow helps organize multiple jobs but does not create blind automatic orders or charges. Review each destination and order detail before checkout.",
  },
] as const;

export function bulkSmmFaqs() {
  return [
    {
      question: "Can SocialRUSH handle bulk SMM orders for agencies in India?",
      answer:
        "SocialRUSH provides bulk planning and multi-client agency workflows for supported services. Agencies can organize several client requirements, review current catalog information and continue into the normal verified order flow for each destination.",
    },
    {
      question: "Do bulk SMM orders get an automatic discount?",
      answer:
        "No automatic bulk or wholesale discount is promised. The active service catalog and final checkout total remain authoritative. For a larger commercial requirement, use the agency enquiry flow to discuss scope.",
    },
    {
      question: "Can I combine Instagram, YouTube and other platforms in one bulk requirement?",
      answer:
        "Yes, the agency workflow can be used to plan multi-platform requirements across supported services. Each real order still keeps its own service, destination, quantity, current pricing and delivery terms.",
    },
    {
      question: "Does bulk planning automatically place or pay for orders?",
      answer:
        "No. Bulk planning is an operational planning workflow. It does not automatically place orders, charge the wallet or guarantee service availability.",
    },
  ] as const;
}
