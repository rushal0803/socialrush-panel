export type ContentPlatform =
  | "instagram"
  | "youtube"
  | "linkedin"
  | "twitter"
  | "facebook"
  | "tiktok";

type ContentLink = Readonly<{ label: string; href: string }>;

export type ContentCluster = {
  platform: ContentPlatform;
  label: string;
  hubPath: string;
  hubLabel: string;
  serviceLinks: ReadonlyArray<ContentLink>;
  guideLinks: ReadonlyArray<ContentLink>;
};

/**
 * The single source of truth for the public content graph. Keep this focused
 * on broad platform intent: transactional pages retain their own intent.
 */
export const contentClusters: Record<ContentPlatform, ContentCluster> = {
  instagram: {
    platform: "instagram",
    label: "Instagram",
    hubPath: "/instagram-growth-india",
    hubLabel: "Instagram growth hub",
    serviceLinks: [
      { label: "Buy Instagram followers in India", href: "/buy-instagram-followers-india" },
      { label: "Buy Instagram likes in India", href: "/instagram-likes" },
      { label: "Buy Instagram views in India", href: "/instagram-views" },
      { label: "Buy Instagram comments in India", href: "/buy-instagram-comments-india" },
      { label: "Buy Instagram saves in India", href: "/buy-instagram-saves-india" },
      { label: "Buy Instagram shares in India", href: "/buy-instagram-shares-india" },
    ],
    guideLinks: [
      { label: "How to grow Instagram followers organically in India", href: "/blog/how-to-grow-instagram-followers-organically-india" },
      { label: "Instagram followers vs likes for Indian creators", href: "/blog/instagram-followers-vs-likes-india" },
      { label: "Instagram follower pricing guide for India", href: "/blog/instagram-followers-price-in-india" },
    ],
  },
  youtube: {
    platform: "youtube",
    label: "YouTube",
    hubPath: "/youtube-growth-india",
    hubLabel: "YouTube growth hub",
    serviceLinks: [
      { label: "Buy YouTube subscribers in India", href: "/youtube-subscribers" },
      { label: "Buy YouTube views in India", href: "/youtube-views" },
      { label: "Buy YouTube likes in India", href: "/youtube-likes" },
      { label: "Buy YouTube comments in India", href: "/buy-youtube-comments-india" },
      { label: "Buy YouTube watch hours in India", href: "/buy-youtube-watch-hours-india" },
    ],
    guideLinks: [
      { label: "How to promote a new YouTube channel in India", href: "/blog/how-to-promote-new-youtube-channel-in-india" },
      { label: "YouTube subscribers vs views for Indian creators", href: "/blog/youtube-subscribers-vs-views-india" },
      { label: "YouTube views pricing guide for India", href: "/blog/youtube-views-price-in-india" },
    ],
  },
  linkedin: {
    platform: "linkedin",
    label: "LinkedIn",
    hubPath: "/linkedin-growth-india",
    hubLabel: "LinkedIn growth hub",
    serviceLinks: [
      { label: "Buy LinkedIn followers in India", href: "/linkedin-followers" },
      { label: "Buy LinkedIn likes in India", href: "/linkedin-likes" },
    ],
    guideLinks: [
      { label: "LinkedIn growth tips for personal brands", href: "/blog/linkedin-growth-tips-personal-brands" },
      { label: "LinkedIn followers for business growth", href: "/blog/linkedin-followers-for-business-growth" },
      { label: "LinkedIn followers vs engagement in India", href: "/blog/linkedin-followers-vs-engagement-india" },
    ],
  },
  twitter: {
    platform: "twitter",
    label: "X / Twitter",
    hubPath: "/x-growth-india",
    hubLabel: "X / Twitter growth hub",
    serviceLinks: [{ label: "Buy X / Twitter followers in India", href: "/twitter-followers" }],
    guideLinks: [
      { label: "Why public-link ordering is safer", href: "/blog/why-public-link-ordering-is-safer" },
      { label: "How social media growth campaigns work", href: "/blog/how-social-media-growth-campaigns-work" },
      { label: "Campaign budget planning for India", href: "/blog/social-media-campaign-budget-planning-india" },
    ],
  },
  facebook: {
    platform: "facebook",
    label: "Facebook",
    hubPath: "/facebook-growth-india",
    hubLabel: "Facebook growth hub",
    serviceLinks: [
      { label: "Buy Facebook followers in India", href: "/buy-facebook-followers-india" },
      { label: "Buy Facebook likes in India", href: "/facebook-likes" },
      { label: "Buy Facebook views in India", href: "/facebook-views" },
      { label: "Buy Facebook shares in India", href: "/buy-facebook-shares-india" },
      { label: "Buy Facebook group members in India", href: "/buy-facebook-group-members-india" },
    ],
    guideLinks: [
      { label: "Facebook page growth tips for local businesses", href: "/blog/facebook-page-growth-tips-for-local-businesses" },
      { label: "Facebook followers vs engagement in India", href: "/blog/facebook-followers-vs-engagement-india" },
      { label: "How small businesses build social proof online", href: "/blog/how-small-businesses-build-social-proof-online" },
    ],
  },
  tiktok: {
    platform: "tiktok",
    label: "TikTok",
    hubPath: "/tiktok-growth-india",
    hubLabel: "TikTok growth hub",
    serviceLinks: [{ label: "Buy TikTok followers in India", href: "/tiktok-followers" }],
    guideLinks: [
      { label: "Why public-link ordering is safer", href: "/blog/why-public-link-ordering-is-safer" },
      { label: "Social media growth strategy for Indian creators", href: "/blog/social-media-growth-strategy-indian-creators" },
      { label: "Social media campaign mistakes to avoid", href: "/blog/social-media-campaign-mistakes-to-avoid" },
    ],
  },
};

export function getContentCluster(platform: ContentPlatform | null) {
  return platform ? contentClusters[platform] : null;
}

export function isContentClusterPath(path: string) {
  return Object.values(contentClusters).some((cluster) => cluster.hubPath === path);
}
