export type TrustEvidenceKind =
  | "ordering"
  | "pricing"
  | "tracking"
  | "refill"
  | "support"
  | "policy"
  | "review";

export type TrustEvidence = Readonly<{
  id: string;
  kind: TrustEvidenceKind;
  title: string;
  detail: string;
  href: string;
  evidence: string;
}>;

const baseTrustEvidence: readonly TrustEvidence[] = [
  {
    id: "public-link-ordering",
    kind: "ordering",
    title: "Public-link ordering",
    detail: "Applicable services use the requested public profile, post, page, channel, video or group URL.",
    href: "/trust",
    evidence: "No social-media password, OTP or recovery code is required for public-link orders.",
  },
  {
    id: "live-pricing",
    kind: "pricing",
    title: "Price before confirmation",
    detail: "Current service pricing and quantity-based totals are shown before an eligible order is confirmed.",
    href: "/pricing",
    evidence: "The checkout and service catalog remain the source of truth for the current amount.",
  },
  {
    id: "order-record",
    kind: "tracking",
    title: "Account-based order record",
    detail: "Submitted orders keep their current status and order record inside the customer account.",
    href: "/dashboard/orders",
    evidence: "Customers can use the Order ID when asking support about an order.",
  },
  {
    id: "refill-terms",
    kind: "refill",
    title: "Refill terms shown when eligible",
    detail: "Refill coverage is not universal and applies only where the active service or package states it.",
    href: "/trust",
    evidence: "Service-specific details are reviewed before checkout instead of relying on a blanket guarantee.",
  },
  {
    id: "official-support",
    kind: "support",
    title: "Official support paths",
    detail: "Order, payment and account help is routed through SocialRUSH support and account records.",
    href: "/support",
    evidence: "Support guidance tells customers what reference to provide and what sensitive information never to share.",
  },
  {
    id: "published-policies",
    kind: "policy",
    title: "Published policies",
    detail: "Refund, privacy and terms guidance is available publicly before a customer orders.",
    href: "/refund-policy",
    evidence: "Policy pages explain eligibility and limitations instead of promising outcomes that cannot be guaranteed.",
  },
] as const;

export function buildPublicTrustEvidence({
  hasPermissionedCompletedOrderReviews,
}: {
  hasPermissionedCompletedOrderReviews: boolean;
}): readonly TrustEvidence[] {
  if (!hasPermissionedCompletedOrderReviews) return baseTrustEvidence;

  return [
    ...baseTrustEvidence,
    {
      id: "permissioned-completed-order-reviews",
      kind: "review",
      title: "Permissioned completed-order reviews",
      detail: "Public reviews are shown only after moderation and customer permission.",
      href: "/reviews",
      evidence: "The public review query independently requires an approved review tied to a completed order.",
    },
  ];
}

export const trustClaimGuardrails = {
  prohibitedWithoutEvidence: [
    "guaranteed results",
    "guaranteed followers",
    "guaranteed sales",
    "verified purchase",
    "real followers",
    "genuine followers",
    "99.9% platform availability",
    "average reach improvement",
  ],
  reviewRequirements: [
    "authenticated customer",
    "completed order",
    "approved moderation status",
    "public display permission",
    "no active removal request",
  ],
} as const;
