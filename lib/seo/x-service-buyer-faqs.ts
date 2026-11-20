// One source for visible FAQ answers and their existing FAQPage graph.
export const xServiceBuyerFaqs: Readonly<Record<string, ReadonlyArray<readonly [string, string]>>> = {
  "twitter-likes": [
    ["Do X likes include reposts or new followers?", "No. A post-like package concerns the selected eligible public post. Reposts and profile followers are separate services; likes do not establish endorsement, genuine audience interest or website visits."],
    ["Can likes disappear after delivery?", "Platform filtering or account changes can alter visible counts. Check the selected service's current refill conditions before ordering; a refund or replacement is subject to the published conditions, not an automatic guarantee."],
  ],
  "twitter-views": [
    ["Are X post views unique people or complete video watches?", "A post view count alone does not establish unique viewers, complete video viewing or time spent reading. Review the selected service's counting conditions and use X analytics to assess retention and meaningful activity separately."],
    ["Will post views send visitors to my website?", "Views on an X post are not website sessions or conversions. Measure outbound clicks, verified website visits and paid orders independently; no package guarantees those outcomes."],
  ],
  "twitter-retweets": [
    ["Does an X repost package include quote posts or comments?", "Do not assume it does. Reposts concern the supported repost action on the selected public post. Quote posts, customer-supplied comments, likes and followers are different actions; confirm the selected service's exact scope."],
    ["Will reposts guarantee organic distribution?", "No. Repost counts do not establish authentic recommendations, a particular audience location, website visits or sales. Check X's rules and the selected service's delivery and refill conditions before ordering."],
  ],
  "twitter-crypto-followers": [
    ["Does the crypto label verify followers as investors?", "No. A catalog label does not verify account expertise, genuine cryptocurrency interest, financial capacity or intent to invest. Do not present ordered follower counts as evidence of investor demand or endorsement."],
    ["Does this follower package include activity on my X posts?", "A follower package concerns the eligible public profile. Likes, reposts and comments on individual posts are separate services. A larger displayed follower count does not guarantee engagement, retained followers or sales."],
  ],
};
