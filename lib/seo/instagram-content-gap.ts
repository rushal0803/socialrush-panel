export type InstagramContentGapDecision = "implement" | "defer" | "covered";

export type InstagramContentGapCandidate = Readonly<{
  id: string;
  queryTheme: string;
  intent: "informational" | "commercial-research";
  decision: InstagramContentGapDecision;
  primaryTarget: string;
  reason: string;
  cannibalizationRisk: "low" | "medium" | "high";
  businessRelevance: 1 | 2 | 3 | 4 | 5;
  internalLinkValue: 1 | 2 | 3 | 4 | 5;
  uniqueInformationValue: 1 | 2 | 3 | 4 | 5;
}>;

/**
 * Phase 13 content-gap decisions.
 *
 * This is intentionally a decision map rather than a keyword factory.
 * A new article is allowed only when it owns a distinct user question and
 * can strengthen an existing canonical without competing with it.
 */
export const instagramContentGapCandidates: readonly InstagramContentGapCandidate[] = [
  {
    id: "followers-price-india",
    queryTheme: "Instagram followers price in India",
    intent: "commercial-research",
    decision: "covered",
    primaryTarget: "/blog/instagram-followers-price-in-india",
    reason: "A dedicated pricing guide already owns this research intent.",
    cannibalizationRisk: "high",
    businessRelevance: 5,
    internalLinkValue: 5,
    uniqueInformationValue: 1,
  },
  {
    id: "organic-followers-india",
    queryTheme: "how to grow Instagram followers organically in India",
    intent: "informational",
    decision: "covered",
    primaryTarget: "/blog/how-to-grow-instagram-followers-organically-india",
    reason: "Existing long-form guidance already owns the organic-growth intent.",
    cannibalizationRisk: "high",
    businessRelevance: 4,
    internalLinkValue: 4,
    uniqueInformationValue: 1,
  },
  {
    id: "followers-vs-engagement",
    queryTheme: "Instagram followers vs engagement",
    intent: "informational",
    decision: "covered",
    primaryTarget: "/blog/instagram-followers-vs-engagement",
    reason: "The existing decision framework directly covers this comparison.",
    cannibalizationRisk: "high",
    businessRelevance: 5,
    internalLinkValue: 5,
    uniqueInformationValue: 1,
  },
  {
    id: "follower-drops",
    queryTheme: "why Instagram followers drop",
    intent: "informational",
    decision: "covered",
    primaryTarget: "/blog/why-instagram-followers-drop",
    reason: "A dedicated troubleshooting guide already owns follower-drop intent.",
    cannibalizationRisk: "high",
    businessRelevance: 4,
    internalLinkValue: 4,
    uniqueInformationValue: 1,
  },
  {
    id: "views-vs-reach",
    queryTheme: "Instagram views vs reach",
    intent: "informational",
    decision: "implement",
    primaryTarget: "/blog/instagram-views-vs-reach",
    reason: "Distinct analytics question with current search demand; it supports the views canonical without duplicating purchase intent.",
    cannibalizationRisk: "low",
    businessRelevance: 4,
    internalLinkValue: 5,
    uniqueInformationValue: 5,
  },
  {
    id: "likes-vs-views",
    queryTheme: "Instagram likes vs views",
    intent: "commercial-research",
    decision: "defer",
    primaryTarget: "/instagram-growth-india",
    reason: "Useful comparison, but current cluster already has followers-vs-likes and multiple service pages; add only after query data proves a separate need.",
    cannibalizationRisk: "medium",
    businessRelevance: 4,
    internalLinkValue: 4,
    uniqueInformationValue: 3,
  },
  {
    id: "profile-optimization",
    queryTheme: "Instagram profile optimization India",
    intent: "informational",
    decision: "defer",
    primaryTarget: "/instagram-growth-india",
    reason: "The growth hub and organic-growth guides already cover profile preparation; a standalone guide needs stronger demand evidence.",
    cannibalizationRisk: "medium",
    businessRelevance: 3,
    internalLinkValue: 4,
    uniqueInformationValue: 3,
  },
  {
    id: "story-views-saves-shares",
    queryTheme: "Instagram Story views saves shares meaning",
    intent: "informational",
    decision: "defer",
    primaryTarget: "/instagram-growth-india",
    reason: "This bundles several different metrics and risks a broad, unfocused article. Revisit only when one metric shows a distinct search need.",
    cannibalizationRisk: "medium",
    businessRelevance: 3,
    internalLinkValue: 3,
    uniqueInformationValue: 3,
  },
] as const;

export const implementedInstagramContentGapTargets = instagramContentGapCandidates
  .filter((candidate) => candidate.decision === "implement")
  .map((candidate) => candidate.primaryTarget);

export function hasUniqueInstagramGapTargets() {
  const targets = instagramContentGapCandidates
    .filter((candidate) => candidate.decision === "implement")
    .map((candidate) => candidate.primaryTarget);
  return new Set(targets).size === targets.length;
}
