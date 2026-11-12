export const engagementBuyerChecks = {
  "facebook-views": {
    heading: "What do Facebook view counts tell you?",
    questions: [
      ["Are Facebook views the same as watch time?", "No. A view count is not a promise that each person watched the full video. Review watch time, retention and meaningful interactions in Facebook's own insights separately."],
      ["Does ordering in India guarantee Indian viewers?", "No. INR pricing and an India service page do not guarantee viewers from India, a particular language or people interested in your offer. Confirm any supported targeting in the selected service terms."],
      ["Do purchased views guarantee organic distribution or sales?", "No. Purchased view counts do not establish authentic audience interest or guarantee organic reach, followers, website visits or sales. Compare useful conversations and qualified enquiries separately; review Meta's rules before using a third-party service."],
    ],
    links: [
      ["Facebook followers: a different service", "/buy-facebook-followers-india"],
      ["Facebook post likes", "/facebook-likes"],
      ["Facebook service hub", "/facebook-growth-india"],
      ["Read refund conditions", "/refund-policy"],
    ],
  },
  "linkedin-likes": {
    heading: "What do LinkedIn likes tell you?",
    questions: [
      ["Which LinkedIn post types should I verify before ordering?", "Use the exact public post permalink and confirm whether the selected service supports a personal-profile post, company-page post or repost. Public visibility alone does not establish compatibility. Do not submit a profile homepage, private group post or login-only destination as a substitute."],
      ["Can purchased LinkedIn likes validate a message or offer?", "No. Ordered likes are not an independent test of an audience's preferences. Keep them separate from voluntary comments, saves, profile visits and genuine enquiries when evaluating a post. A count does not establish unique readers, reading time or qualified demand."],
      ["Will LinkedIn post likes increase my follower count?", "Likes and followers are different services. A post-like package applies to the selected public post; it does not include new profile followers or company-page followers. Check the exact post destination before ordering."],
      ["Do likes prove professional credibility or buyer interest?", "No. A like count alone does not prove that decision-makers read your post, endorse your work or want to buy from you. Evaluate relevant conversations, profile visits and qualified enquiries independently."],
      ["Are LinkedIn likes guaranteed to be Indian or relevant to my industry?", "No. Ordering in INR does not guarantee Indian accounts, an industry match, organic distribution, leads or sales. Review the service's supported targeting and LinkedIn's rules before ordering."],
    ],
    links: [
      ["LinkedIn follower eligibility", "/linkedin-followers"],
      ["Followers versus engagement", "/blog/linkedin-followers-vs-engagement-india"],
      ["LinkedIn service hub", "/linkedin-growth-india"],
      ["Read refund conditions", "/refund-policy"],
    ],
  },
} as const;

export type EngagementBuyerService = keyof typeof engagementBuyerChecks;

export function engagementBuyerFaqSchema(service: EngagementBuyerService) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: engagementBuyerChecks[service].questions.map(([name, text]) => ({
      "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text },
    })),
  };
}
