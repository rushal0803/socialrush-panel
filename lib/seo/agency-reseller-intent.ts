export const agencyResellerIntentKeywords = [
  "social media growth platform for agencies India",
  "agency social media growth services India",
  "multi client social media campaign management",
  "bulk social media services India",
  "agency campaign planning platform India",
  "social media API for agencies India",
] as const;

export const agencyResellerCriteria = [
  {
    id: "clients",
    title: "Multi-client workspace",
    text: "Keep client and campaign context connected to orders instead of managing every requirement as an isolated transaction.",
    href: "/dashboard/reseller",
    cta: "Open agency workspace",
  },
  {
    id: "bulk",
    title: "Bulk planning without blind auto-ordering",
    text: "Prepare several client jobs, review the current catalog estimate, then open the normal verified order flow for each destination.",
    href: "/dashboard/reseller/bulk-planner",
    cta: "Open bulk planner",
  },
  {
    id: "monthly",
    title: "Monthly plan and quote workflow",
    text: "Build client-scoped monthly plans, save planning baselines and review renewal timing without creating an automatic subscription or charge.",
    href: "/dashboard/reseller/monthly-planner",
    cta: "Build monthly plan",
  },
  {
    id: "api",
    title: "API documentation for connected workflows",
    text: "Signed-in users can review the available SocialRUSH API documentation before deciding whether an API-based workflow fits their operation.",
    href: "/dashboard/api-docs",
    cta: "Review API docs",
  },
] as const;

export function agencyResellerFaqs() {
  return [
    {
      question: "Is SocialRUSH suitable for agencies managing multiple client campaigns?",
      answer:
        "Yes. SocialRUSH provides an agency workflow for managing client campaigns, bulk planning, monthly plans, order tracking and current service information. Review the live workspace and service catalog to decide whether it fits your agency process.",
    },
    {
      question: "Is SocialRUSH a white-label reseller system?",
      answer:
        "No white-label reseller system is promised on this page. The SocialRUSH agency workflow focuses on client workspaces, bulk planning, campaign operations, monthly planning, order tracking and available API documentation.",
    },
    {
      question: "Do agencies get automatic volume discounts?",
      answer:
        "No automatic volume discount is promised. Current catalog pricing and the final checkout total remain authoritative. Agencies can keep their own client pricing, service fee and margin strategy separate.",
    },
    {
      question: "Can agencies manage several client campaigns?",
      answer:
        "Yes. The agency workspace, saved clients, campaign attribution and bulk planner are designed to keep multiple client requirements organized. Each order still follows the normal validation and payment flow.",
    },
  ] as const;
}
