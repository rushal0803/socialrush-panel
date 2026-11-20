// Shared by visible server content and the existing FAQ graph. No catalog or order facts.
export const batch4ServiceFaqs: Readonly<Record<string, ReadonlyArray<readonly [string, string]>>> = {
  "telegram-post-views": [
    [
      "Which Telegram message should receive the views?",
      "Use the direct link to the eligible public channel post, not only the channel homepage or an invite link. Open that exact message while signed out and confirm it is the intended destination. Private messages and deleted posts need a separate eligibility check before payment."
    ],
    [
      "Do Telegram post views measure unique readers?",
      "A displayed view count does not establish unique people, reading time or comprehension. Compare link clicks and voluntary replies separately. Views do not add channel members or prove that anyone read every word."
    ]
  ],
  "telegram-post-reactions": [
    [
      "Can I select any Telegram reaction emoji?",
      "Check which reactions the target post permits and which reaction types the selected service supports. An emoji visible elsewhere in Telegram is not proof that this package supports it. Confirm the requested reaction and exact public message link before ordering."
    ],
    [
      "Do ordered reactions represent a customer survey?",
      "No. A purchased reaction count is not independent audience feedback, customer satisfaction or a representative sample. Keep it separate from voluntary reactions when evaluating content; reactions do not include poll votes or new members."
    ]
  ],
  "telegram-poll-votes": [
    [
      "What must I confirm before ordering Telegram poll votes?",
      "Identify the exact eligible public poll, the intended answer option and whether voting is still open. Check service instructions for option formatting and supported poll types; do not infer support for quizzes or multiple-answer polls from a generic poll-votes label."
    ],
    [
      "Can purchased poll votes validate a business decision?",
      "No. Ordered votes bias the result and are not representative research or verified customer preferences. Do not present the altered tally as an independent survey, election result or proof of demand. Use a separate voluntary research sample for decisions."
    ]
  ],
  "twitter-crypto-likes": [
    [
      "Does a crypto-like package verify interest in a token?",
      "No. The crypto catalog label does not verify an account’s expertise, ownership of a token or investment intent. A like count must not be presented as investor demand, financial endorsement or evidence that a project is safe."
    ],
    [
      "Should I submit a token page or an X post?",
      "This action concerns the eligible public X post. Supply its direct post URL, not a token contract address, exchange listing or profile homepage. Likes do not include reposts, replies or visits to an external project website."
    ]
  ],
  "twitter-crypto-retweets": [
    [
      "Are crypto reposts the same as quote-post commentary?",
      "No. A repost redistributes the supported public post using X’s repost action. Do not assume a package includes quote-post text, original analysis or custom replies. Confirm the exact action in the current service instructions."
    ],
    [
      "Can crypto repost counts demonstrate financial credibility?",
      "No. Purchased reposts do not verify independent recommendations, investors or trading volume. Measure voluntary discussion and verified website activity separately; neither the niche label nor a repost tally establishes project legitimacy."
    ]
  ],
  "twitter-crypto-custom-comments": [
    [
      "How should I prepare custom crypto comment text?",
      "Review the selected service’s required text format and quantity rules before ordering. Check every supplied line for accuracy and permission to use it. Do not submit fabricated customer experiences, invented investment returns or claims of independent endorsement."
    ],
    [
      "Will supplied X comments remain visible?",
      "Visibility depends on X moderation, post settings and later account changes. Confirm that replies are allowed on the exact public post and review current refill or refund conditions. Delivery does not guarantee permanent display, meaningful discussion or sales."
    ]
  ]
};

export const batch4CatalogGuides = {
  "telegram": {
    "heading": "Check the Telegram destination before choosing an action",
    "checks": [
      [
        "One message or the whole community?",
        "Members concern a channel or group; views and reactions concern a specific public message. Poll votes need the exact supported poll and answer option. Keep a separate destination record for each action."
      ],
      [
        "Keep voluntary feedback separate",
        "Purchased reactions and poll votes can change the displayed tally without measuring genuine preferences. Do not combine them with voluntary responses in a customer-research report."
      ]
    ],
    "links": [
      [
        "/telegram-members",
        "Channel and group members"
      ],
      [
        "/services/telegram-post-views",
        "Message views"
      ],
      [
        "/services/telegram-post-reactions",
        "Post reaction requirements"
      ],
      [
        "/services/telegram-poll-votes",
        "Poll option checks"
      ]
    ]
  },
  "twitter-x": {
    "heading": "Match the X action to the profile or post",
    "checks": [
      [
        "Profile growth and post activity use different links",
        "Followers concern an eligible public profile. Likes, views, reposts and supplied comments concern an individual public post. An old Twitter URL and an X URL still need to resolve to the same intended destination."
      ],
      [
        "A niche label is not financial verification",
        "Crypto service labels do not establish account expertise, investor intent or independent recommendations. Never use purchased counts as evidence of investment demand, trading volume or project legitimacy."
      ]
    ],
    "links": [
      [
        "/twitter-followers",
        "Profile follower requirements"
      ],
      [
        "/services/twitter-crypto-likes",
        "Crypto post likes"
      ],
      [
        "/services/twitter-crypto-retweets",
        "Crypto repost scope"
      ],
      [
        "/services/twitter-crypto-custom-comments",
        "Custom comment preparation"
      ]
    ]
  },
  "linkedin": {
    "heading": "Choose the LinkedIn object and verify the scope",
    "checks": [
      [
        "A connection is not a follower",
        "Connections involve a profile relationship; followers and post likes are separate actions. Confirm whether the selected service accepts a personal profile, company Page, post or skill before sending a link. Do not infer company-Page support from the platform name."
      ],
      [
        "USA labels do not establish professional relevance",
        "A location label does not independently verify occupation, seniority, purchasing authority or industry fit. Ordered followers, endorsements and replies must not be presented as earned professional recommendations or qualified leads."
      ]
    ],
    "links": [
      [
        "/linkedin-followers",
        "Follower eligibility"
      ],
      [
        "/linkedin-likes",
        "Post-like requirements"
      ],
      [
        "/services/linkedin-usa-connections",
        "Connection scope"
      ],
      [
        "/services/linkedin-usa-endorsements",
        "Skill endorsement details"
      ]
    ]
  },
  "tiktok": {
    "heading": "Review TikTok access and supported destinations first",
    "checks": [
      [
        "Check local access without relying on a workaround",
        "Confirm applicable local restrictions and whether you can lawfully access the intended public profile. A catalog entry does not establish current local availability. If you cannot verify the destination, resolve that uncertainty before ordering."
      ],
      [
        "Catalog availability and search eligibility differ",
        "The catalog lists actions that may require additional live checks. A follower order does not include video views, comments or saves. Keep content retention and voluntary engagement metrics separate from purchased follower counts."
      ]
    ],
    "links": [
      [
        "/tiktok-followers",
        "Public follower requirements"
      ],
      [
        "/tiktok-growth-india",
        "TikTok planning and limitations"
      ],
      [
        "/terms",
        "Service terms"
      ],
      [
        "/refund-policy",
        "Refund conditions"
      ]
    ]
  }
} as const;
