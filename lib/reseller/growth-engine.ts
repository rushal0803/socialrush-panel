export type AgencyGrowthDecisionKind =
  | "first_client"
  | "attribution"
  | "first_plan"
  | "renewal"
  | "retainer"
  | "campaign"
  | "scale";

export type AgencyGrowthDecision = {
  kind: AgencyGrowthDecisionKind;
  stage: "Setup" | "Organize" | "Recurring" | "Renew" | "Scale";
  stageNumber: 1 | 2 | 3 | 4 | 5;
  totalStages: 5;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  promotional: boolean;
};

export type AgencyGrowthSignals = {
  activeClients: number;
  completedOrders: number;
  unassignedOrders: number;
  repeatClients: number;
  savedMonthlyPlans: number;
  renewalsDueNow: number;
  activeCampaigns: number;
  plannedMonthlyValue: number;
  signalsReliable: boolean;
};

export function buildAgencyGrowthDecision(
  signals: AgencyGrowthSignals,
): AgencyGrowthDecision | null {
  if (!signals.signalsReliable) return null;

  if (signals.activeClients < 1) {
    return {
      kind: "first_client",
      stage: "Setup",
      stageNumber: 1,
      totalStages: 5,
      eyebrow: "Agency activation",
      title: "Create your first client workspace.",
      description:
        "Separate client names, profiles and future orders before volume grows. This keeps attribution and recurring planning clean from the start.",
      href: "/dashboard/clients",
      cta: "Add first client",
      promotional: false,
    };
  }

  if (signals.unassignedOrders > 0) {
    return {
      kind: "attribution",
      stage: "Organize",
      stageNumber: 2,
      totalStages: 5,
      eyebrow: "Clean client attribution",
      title: `${signals.unassignedOrders} order${signals.unassignedOrders === 1 ? " is" : "s are"} not linked to a client.`,
      description:
        "Link existing work to the right client workspace before building recurring plans so portfolio and renewal reporting stay accurate.",
      href: "/dashboard/clients",
      cta: "Organize client work",
      promotional: false,
    };
  }

  if (signals.savedMonthlyPlans < 1) {
    return {
      kind: "first_plan",
      stage: "Recurring",
      stageNumber: 3,
      totalStages: 5,
      eyebrow: "Build recurring value",
      title: "Turn one client requirement into a saved monthly plan.",
      description:
        "Use current fulfillment pricing, your own markup and a client-ready proposal. Nothing is ordered or charged automatically.",
      href: "/dashboard/reseller/monthly-planner",
      cta: "Build first monthly plan",
      promotional: true,
    };
  }

  if (signals.renewalsDueNow > 0) {
    return {
      kind: "renewal",
      stage: "Renew",
      stageNumber: 4,
      totalStages: 5,
      eyebrow: "Renewal priority",
      title: `${signals.renewalsDueNow} saved plan${signals.renewalsDueNow === 1 ? " needs" : "s need"} review now.`,
      description:
        "Review current fulfillment cost and the saved client quote before starting the next cycle. No renewal is submitted automatically.",
      href: "/dashboard/reseller/portfolio",
      cta: "Review renewals",
      promotional: false,
    };
  }

  if (signals.repeatClients < 1 && signals.completedOrders > 0) {
    return {
      kind: "retainer",
      stage: "Renew",
      stageNumber: 4,
      totalStages: 5,
      eyebrow: "Convert repeat demand",
      title: "Identify the clients most likely to become recurring accounts.",
      description:
        "Use completed-order frequency and recent fulfilled value to find clients worth approaching for planned monthly work.",
      href: "/dashboard/retainers",
      cta: "Review retainer candidates",
      promotional: true,
    };
  }

  if (signals.activeCampaigns < 1) {
    return {
      kind: "campaign",
      stage: "Scale",
      stageNumber: 5,
      totalStages: 5,
      eyebrow: "Operational scale",
      title: "Group the next client requirement into a campaign.",
      description:
        "Use campaign attribution when several services belong to the same client objective, while keeping every real order individually reviewed.",
      href: "/dashboard/campaigns",
      cta: "Create campaign",
      promotional: true,
    };
  }

  return {
    kind: "scale",
    stage: "Scale",
    stageNumber: 5,
    totalStages: 5,
    eyebrow: "Agency scale",
    title: "Your reseller workflow is ready for larger multi-client planning.",
    description:
      signals.plannedMonthlyValue > 0
        ? `You currently have ₹${Math.round(signals.plannedMonthlyValue).toLocaleString("en-IN")} in saved monthly client quotes. Use the bulk planner to organize more jobs without bypassing normal checkout controls.`
        : "Use the bulk planner to organize more client jobs without bypassing normal checkout controls.",
    href: "/dashboard/reseller/bulk-planner",
    cta: "Open bulk planner",
    promotional: true,
  };
}
