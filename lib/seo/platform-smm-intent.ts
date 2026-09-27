import type { ContentPlatform } from "./content-clusters";

export const platformSmmIntent: Record<ContentPlatform, {
  primaryKeyword: string;
  aliases: readonly string[];
  description: string;
}> = {
  instagram: {
    primaryKeyword: "Instagram SMM panel India",
    aliases: ["/instagram-smm-panel-india", "/smm-panel-for-instagram-india"],
    description: "Compare Instagram follower, like, view, comment, save and share services from one canonical India growth hub.",
  },
  youtube: {
    primaryKeyword: "YouTube SMM panel India",
    aliases: ["/youtube-smm-panel-india", "/smm-panel-for-youtube-india"],
    description: "Compare YouTube subscriber, view, like, comment and watch-hour services from one canonical India growth hub.",
  },
  linkedin: {
    primaryKeyword: "LinkedIn SMM panel India",
    aliases: ["/linkedin-smm-panel-india", "/smm-panel-for-linkedin-india"],
    description: "Compare LinkedIn follower and post-engagement services from one canonical India growth hub.",
  },
  twitter: {
    primaryKeyword: "Twitter / X SMM panel India",
    aliases: ["/twitter-smm-panel-india", "/x-smm-panel-india"],
    description: "Compare Twitter / X follower and engagement services from one canonical India growth hub.",
  },
  facebook: {
    primaryKeyword: "Facebook SMM panel India",
    aliases: ["/facebook-smm-panel-india", "/smm-panel-for-facebook-india"],
    description: "Compare Facebook follower, group-member, like, view and share services from one canonical India growth hub.",
  },
  tiktok: {
    primaryKeyword: "TikTok SMM panel India",
    aliases: ["/tiktok-smm-panel-india", "/smm-panel-for-tiktok-india"],
    description: "Compare TikTok follower and available engagement services from one canonical India growth hub.",
  },
  telegram: {
    primaryKeyword: "Telegram SMM panel India",
    aliases: ["/telegram-smm-panel-india", "/smm-panel-for-telegram-india"],
    description: "Compare Telegram member, post-view, reaction and poll-vote services from one canonical Telegram service hub.",
  },
};

export function platformSmmKeywords(platform: ContentPlatform) {
  const config = platformSmmIntent[platform];
  return [
    config.primaryKeyword,
    `${platform === "twitter" ? "X" : platform[0]?.toUpperCase() + platform.slice(1)} social media panel India`,
    `${platform === "twitter" ? "Twitter X" : platform} growth services India`,
  ];
}
