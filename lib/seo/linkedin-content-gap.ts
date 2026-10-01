export type LinkedInContentGapDecision = "implement" | "defer" | "covered";

export type LinkedInContentGapCandidate = Readonly<{
  id: string;
  queryTheme: string;
  intent: "informational" | "commercial-research";
  decision: LinkedInContentGapDecision;
  primaryTarget: string;
  reason: string;
  cannibalizationRisk: "low" | "medium" | "high";
  businessRelevance: 1 | 2 | 3 | 4 | 5;
  internalLinkValue: 1 | 2 | 3 | 4 | 5;
  uniqueInformationValue: 1 | 2 | 3 | 4 | 5;
}>;

/**
 * Phase 14 LinkedIn content-gap decisions.
 *
 * New content is allowed only when it owns a distinct user question and
 * strengthens an existing canonical instead of competing with it.
 */
export const linkedInContentGapCandidates: readonly LinkedInContentGapCandidate[] = [
  {
    id: "followers-price-india",
    queryTheme: "LinkedIn followers price in India",
    intent: "commercial-research",
    decision: "covered",
    primaryTarget: "/blog/linkedin-followers-price-in-india",
    reason: "The existing price guide already owns this research intent.",
    cannibalizationRisk: "high",
    businessRelevance: 5,
    internalLinkValue: 5,
    uniqueInformationValue: 1,
  },
  {
    id: "followers-vs-engagement",
    queryTheme: "LinkedIn followers vs engagement",
    intent: "informational",
    decision: "covered",
    primaryTarget: "/blog/linkedin-followers-vs-engagement-india",
    reason: "The existing comparison guide already owns follower-count versus engagement intent.",
    cannibalizationRisk: "high",
    businessRelevance: 5,
    internalLinkValue: 5,
    uniqueInformationValue: 1,
  },
  {
    id: "personal-brand-growth",
    queryTheme: "LinkedIn growth tips for personal brands",
    intent: "informational",
    decision: "covered",
    primaryTarget: "/blog/linkedin-growth-tips-personal-brands",
    reason: "Existing long-form guidance already owns personal-brand growth intent.",
    cannibalizationRisk: "high",
    businessRelevance: 4,
    internalLinkValue: 4,
    uniqueInformationValue: 1,
  },
  {
    id: "followers-vs-connections",
    queryTheme: "LinkedIn followers vs connections",
    intent: "informational",
    decision: "implement",
    primaryTarget: "/blog/linkedin-followers-vs-connections",
    reason: "Distinct platform-mechanics question with current search activity and official LinkedIn documentation; it supports the follower canonical without duplicating purchase intent.",
    cannibalizationRisk: "low",
    businessRelevance: 5,
    internalLinkValue: 5,
    uniqueInformationValue: 5,
  },
  {
    id: "profile-vs-company-page-followers",
    queryTheme: "LinkedIn profile followers vs company page followers",
    intent: "informational",
    decision: "defer",
    primaryTarget: "/linkedin-growth-india",
    reason: "Useful distinction, but the current follower service already supports profile/company-page destinations and a separate article needs stronger query evidence.",
    cannibalizationRisk: "medium",
    businessRelevance: 4,
    internalLinkValue: 4,
    uniqueInformationValue: 3,
  },
  {
    id: "linkedin-follow-button-strategy",
    queryTheme: "LinkedIn follow button vs connect button",
    intent: "informational",
    decision: "defer",
    primaryTarget: "/blog/linkedin-followers-vs-connections",
    reason: "This is a close variant of the followers-versus-connections question and should strengthen the implemented guide rather than create another URL.",
    cannibalizationRisk: "high",
    businessRelevance: 4,
    internalLinkValue: 4,
    uniqueInformationValue: 2,
  },
] as const;

export const implementedLinkedInContentGapTargets = linkedInContentGapCandidates
  .filter((candidate) => candidate.decision === "implement")
  .map((candidate) => candidate.primaryTarget);

export function hasUniqueLinkedInGapTargets() {
  const targets = linkedInContentGapCandidates
    .filter((candidate) => candidate.decision === "implement")
    .map((candidate) => candidate.primaryTarget);
  return new Set(targets).size === targets.length;
}
