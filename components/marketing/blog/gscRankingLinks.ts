import type { BlogArticle } from "./blogData";

// Selected relevant guides only; existing hub and related-resource links stay intact.
export const gscRankingLinks: Record<string, { prefix: string; label: string; href: string; suffix: string }> = {
  "instagram-followers-vs-likes-india": {
    prefix: "For a campaign aimed at one public post or Reel, review",
    label: "Instagram likes quantities and INR planning",
    href: "/instagram-likes",
    suffix: "; follower orders use a different public-profile destination.",
  },
  "best-time-to-post-on-instagram-india": {
    prefix: "If a public post campaign is part of your plan, check",
    label: "Instagram likes ordering requirements",
    href: "/instagram-likes",
    suffix: " and measure reach, saves and enquiries separately from the like count.",
  },
  "instagram-followers-price-in-india": {
    prefix: "To compare a 1,000-follower quantity with the current order details, open",
    label: "Instagram followers in India",
    href: "/buy-instagram-followers-india",
    suffix: " and confirm the INR total, public-profile requirement and refill terms.",
  },
  "how-to-grow-instagram-followers-in-india": {
    prefix: "If you also plan a paid follower campaign, review",
    label: "public-profile Instagram follower packages",
    href: "/buy-instagram-followers-india",
    suffix: " while continuing to measure content quality and audience relevance.",
  },
  "facebook-page-growth-tips-for-local-businesses": {
    prefix: "For an eligible public page or profile, compare",
    label: "Facebook follower quantities in INR",
    href: "/buy-facebook-followers-india",
    suffix: " and verify the destination before ordering; followers do not guarantee enquiries or sales.",
  },
  "linkedin-followers-for-business-growth": {
    prefix: "Before choosing a personal-profile or company-page campaign, review",
    label: "LinkedIn follower destination requirements",
    href: "/linkedin-followers",
    suffix: ". Confirm company-page eligibility rather than assuming a profile service covers it.",
  },
  "twitter-followers-price-in-india": {
    prefix: "For either an x.com or twitter.com profile, compare",
    label: "X / Twitter follower ordering details",
    href: "/twitter-followers",
    suffix: " and check the active INR total before payment.",
  },
  "youtube-channel-readiness-checklist": {
    prefix: "Once the public channel is ready, review",
    label: "YouTube subscriber service requirements",
    href: "/youtube-subscribers",
    suffix: " and confirm the active total; subscribers alone do not provide watch hours or monetization approval.",
  },
};

export function applyGscRankingLinks(article: BlogArticle): BlogArticle {
  const link = gscRankingLinks[article.slug];
  if (!link || !article.sections.length) return article;
  const index = article.sections.findIndex(section => !section.contextualLink);
  if (index < 0) return article;
  return {
    ...article,
    sections: article.sections.map((section, i) => i === index ? { ...section, contextualLink: link } : section),
  };
}
