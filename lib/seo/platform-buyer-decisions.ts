// Editorial comparisons only: rates, availability and order rules remain catalog-owned.
export const platformBuyerDecisions = {
  instagram: {
    heading: "Choose an Instagram count without confusing it with audience interest",
    checks: [
      ["Profile or individual content?", "Followers apply to an eligible public profile. Likes, comments, saves and shares concern a specific public post or Reel; views concern eligible video content. Open the individual service to confirm its accepted link type."],
      ["What does a save or share establish?", "An ordered count does not show that someone found your content useful, recommended your business or intends to buy. Use Instagram insights and genuine customer feedback to assess those outcomes separately."],
      ["What should I check before paying?", "Review the selected service's live INR total, quantity limits, delivery estimate and refill conditions. INR pricing does not establish Indian audience targeting. Read Instagram's rules and the refund conditions before deciding."],
    ],
  },
  facebook: {
    heading: "Separate Facebook Page, post, video and group requirements",
    checks: [
      ["Which destination does the package support?", "Page followers, post likes, video views, post shares and group members serve different destinations. A group-member order is not a Page-follower package; confirm public access and any group approval requirements on the selected service."],
      ["Does a view mean a complete watch?", "A video view count does not prove full viewing, sustained watch time or interested visitors. Review retention and meaningful conversations in Facebook insights independently."],
      ["Are shares and members guaranteed customers?", "No. Purchased activity does not establish authentic interest, organic distribution or sales. Check Meta's rules, the live delivery and refill terms, and the refund policy; do not assume every package has replacement support."],
    ],
  },
  youtube: {
    heading: "Keep YouTube subscribers, video views and watch time separate",
    checks: [
      ["What link belongs to each service?", "Subscribers concern an eligible public channel; views, likes and comments concern an eligible public video. Check Shorts compatibility on the selected service instead of treating every YouTube URL as interchangeable."],
      ["Will a package qualify my channel for monetization?", "No package guarantees YouTube Partner Program approval or valid public watch hours. Subscriber counts and video views are different measurements, and YouTube determines eligibility under its own rules."],
      ["How should I compare a watch-hours listing?", "Confirm the billed delivery unit and applicable video requirements before paying. An illustration based on video length is not evidence that every view will watch fully or count toward monetization. Review the individual service's current terms and refund conditions."],
    ],
  },
  linkedin: {
    heading: "Compare LinkedIn profile eligibility with post engagement",
    checks: [
      ["Does a follower package cover my company Page?", "Do not infer company-Page support from a general LinkedIn growth label. Confirm the selected service's accepted profile or Page destination before ordering; a post-like package applies to the selected public post."],
      ["Are likes or followers professional endorsements?", "A higher count does not establish professional credibility, verified expertise, hiring interest or qualified leads. Evaluate relevant replies, conversations and enquiries separately."],
      ["What does an India page promise?", "INR pricing and an India-focused page do not establish Indian accounts, industry relevance or location targeting. Check the selected service's actual conditions, LinkedIn's rules and the refund policy before payment."],
    ],
  },
  tiktok: {
    heading: "Check TikTok access and profile eligibility before ordering",
    checks: [
      ["Can I use TikTok where I am?", "An India-focused resource page does not establish that TikTok is accessible or permitted in your location. Verify current local restrictions and platform rules before considering a service; this page does not provide a way around them."],
      ["Which public destination is required?", "A follower package concerns an eligible public TikTok profile. Catalog listings for video engagement have different destinations and conditions; their existence does not establish availability or make them interchangeable with followers."],
      ["What should I confirm about retention?", "Review live availability, quantity limits and refill conditions on the selected service. Ordered follower counts do not establish genuine interest, Indian audience targeting, continued retention or future video reach. Check refund conditions before payment."],
    ],
  },
  twitter: {
    heading: "Choose between X profile followers and activity on one post",
    checks: [
      ["Are retweets and reposts different packages?", "Retweet is Twitter's former name for the action now called a repost on X. Use the eligible public post permalink for reposts, likes or views; a follower package requires the supported public profile destination."],
      ["Do post views measure unique interested readers?", "A view count alone does not establish unique people, full reading, genuine interest or clicks to your website. Check X analytics and independently verified website visits separately."],
      ["Does a crypto service verify investor interest?", "A crypto catalog label does not verify account expertise, purchasing intent or investment interest. Compare the actual service conditions and current availability, and review X's rules and refund conditions before ordering."],
    ],
  },
} as const;

export type BuyerDecisionPlatform = keyof typeof platformBuyerDecisions;
