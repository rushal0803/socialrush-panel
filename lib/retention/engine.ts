export type RetentionDecisionKind =
  | "payment"
  | "support"
  | "refill"
  | "active_order"
  | "post_completion"
  | "repeat"
  | "return";

export type RetentionDecision = {
  kind: RetentionDecisionKind;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  promotional: boolean;
  repeatCount?: number;
};

export type RetentionSignals = {
  completedOrders: number;
  activeOrders: number;
  pendingOrders: number;
  paymentChecks: number;
  openTickets: number;
  activeRefills: number;
  hasCheckoutRecovery: boolean;
  hasDraft: boolean;
  latestCompletedAt: string | null;
  repeatHref: string | null;
  repeatServiceName?: string | null;
  repeatQuantity?: number | null;
  repeatCount?: number;
  signalsReliable: boolean;
};

const dayMs = 86_400_000;

function daysSince(value: string | null, now: Date) {
  if (!value) return null;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return null;
  return Math.max(0, Math.floor((now.getTime() - time) / dayMs));
}

export function buildRetentionDecision(
  signals: RetentionSignals,
  now = new Date(),
): RetentionDecision | null {
  if (!signals.signalsReliable) return null;

  if (signals.paymentChecks > 0) {
    return {
      kind: "payment",
      eyebrow: "Finish the current step first",
      title: "A payment check is still in progress.",
      description:
        "Review the existing order before starting another campaign so you do not create a duplicate payment or order.",
      href: "/dashboard/orders",
      cta: "Review orders",
      promotional: false,
    };
  }

  if (signals.openTickets > 0) {
    return {
      kind: "support",
      eyebrow: "Customer care first",
      title: "You have an open support conversation.",
      description:
        "Resolve the current support issue before planning another campaign. Retention prompts stay out of the way while support is active.",
      href: "/dashboard/support",
      cta: "Open support",
      promotional: false,
    };
  }

  if (signals.activeRefills > 0) {
    return {
      kind: "refill",
      eyebrow: "Customer care first",
      title: "A refill request is still active.",
      description:
        "Track the current refill before repeating or scaling the campaign. No new order is suggested while the refill is unresolved.",
      href: "/dashboard/orders",
      cta: "Track orders",
      promotional: false,
    };
  }

  if (signals.activeOrders > 0 || signals.pendingOrders > 0) {
    return {
      kind: "active_order",
      eyebrow: "Current campaign",
      title: "Your existing order is still active.",
      description:
        "Track the campaign already in progress before deciding whether another order is useful.",
      href: "/dashboard/orders",
      cta: "Track active orders",
      promotional: false,
    };
  }

  // Dedicated checkout/draft recovery already exists elsewhere on the dashboard.
  // Do not compete with it using a second retention CTA.
  if (signals.hasCheckoutRecovery || signals.hasDraft) return null;
  if (signals.completedOrders < 1) return null;

  const ageDays = daysSince(signals.latestCompletedAt, now);
  if (ageDays !== null && ageDays <= 2) {
    return {
      kind: "post_completion",
      eyebrow: "Recent completion",
      title: "Your latest campaign is complete.",
      description:
        "Review the completed order first. When you decide to repeat or scale, current pricing and availability will be checked again.",
      href: "/dashboard/orders",
      cta: "Review completed order",
      promotional: false,
    };
  }

  if (signals.repeatHref) {
    const quantity =
      signals.repeatQuantity && signals.repeatQuantity > 0
        ? ` · ${signals.repeatQuantity.toLocaleString("en-IN")} quantity`
        : "";
    const repeated =
      signals.repeatCount && signals.repeatCount >= 2
        ? ` You have used this setup ${signals.repeatCount} times.`
        : "";

    return {
      kind: "repeat",
      eyebrow: signals.repeatCount && signals.repeatCount >= 2 ? "Frequent campaign" : "Repeat when useful",
      title: signals.repeatServiceName
        ? `Review ${signals.repeatServiceName}${quantity}`
        : "Review a completed campaign",
      description:
        `${repeated} Nothing is submitted automatically; service availability, quantity rules and current price are rechecked before payment.`.trim(),
      href: signals.repeatHref,
      cta: "Review repeat order",
      promotional: true,
      repeatCount: signals.repeatCount,
    };
  }

  return {
    kind: "return",
    eyebrow: "Ready when you are",
    title: "Your completed campaigns are saved for easy reuse.",
    description:
      "Open the repeat workspace whenever another campaign fits your plan. Current service availability and pricing are checked before checkout.",
    href: "/dashboard/repeat-campaigns",
    cta: "Open repeat workspace",
    promotional: true,
  };
}
