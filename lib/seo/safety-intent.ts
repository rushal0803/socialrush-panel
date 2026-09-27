export type SafetyIntentPlatform = "youtube" | "linkedin" | "x" | "telegram";

export type SafetyPolicyReference = {
  label: string;
  href: string;
  summary: string;
};

const policyReferences: Record<SafetyIntentPlatform, SafetyPolicyReference> = {
  youtube: {
    label: "YouTube Fake Engagement policy",
    href: "https://support.google.com/youtube/answer/3399767",
    summary:
      "YouTube says artificial increases to views, likes, comments or other metrics are not allowed and that hired promotion methods can affect the channel.",
  },
  linkedin: {
    label: "LinkedIn Professional Community Policies",
    href: "https://www.linkedin.com/legal/professional-community-policies",
    summary:
      "LinkedIn requires authentic participation and says members should not artificially increase engagement.",
  },
  x: {
    label: "X Authenticity policy",
    href: "https://help.x.com/en/rules-and-policies/authenticity",
    summary:
      "X prohibits inauthentic activity and compensated or coordinated metric inflation across follows and other engagement features.",
  },
  telegram: {
    label: "Telegram Spam FAQ",
    href: "https://telegram.org/faq_spam",
    summary:
      "Telegram warns that unsolicited messaging and adding people to unwanted groups or channels can lead to spam reports and account limitations.",
  },
};

export function safetyPolicyFor(platform: SafetyIntentPlatform) {
  return policyReferences[platform];
}

export function buildSafetyIntentCopy({
  serviceName,
  platform,
  destination,
}: {
  serviceName: string;
  platform: SafetyIntentPlatform;
  destination: string;
}) {
  const policy = safetyPolicyFor(platform);
  return {
    heading: `Is it safe to buy ${serviceName}?`,
    intro:
      `No third-party growth service can be described as risk-free. SocialRUSH lowers account-access risk by using the ${destination} and not asking for a social-media password, OTP or recovery code. That is separate from platform-policy risk: ${policy.summary} Review the current platform policy and the active service terms before ordering.`,
    checks: [
      {
        title: "Account-access risk",
        body: `Use only the ${destination}. Never provide a password, OTP, recovery code, session cookie or private login for a public-link order.`,
      },
      {
        title: "Platform-policy risk",
        body: `Third-party growth activity can be restricted by platform rules. Read the current ${policy.label} before deciding whether the service fits your risk tolerance.`,
      },
      {
        title: "Retention and delivery risk",
        body:
          "Visible counts can change because platforms review accounts and activity. Delivery or refill terms do not create a permanent-retention guarantee.",
      },
      {
        title: "Outcome risk",
        body:
          "A purchased metric does not guarantee organic reach, engagement, ranking, leads, revenue, monetization or sales.",
      },
    ],
  };
}
