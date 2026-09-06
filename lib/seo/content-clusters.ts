export type ContentPlatform = "instagram" | "youtube" | "linkedin" | "twitter" | "facebook" | "tiktok";

export type ContentCluster = {
  platform: ContentPlatform;
  label: string;
  hubPath: string;
  hubLabel: string;
  serviceLinks: ReadonlyArray<{ label: string; href: string }>;
};

/**
 * The single source of truth for the public content graph. Keep this focused
 * on broad platform intent: transactional pages retain their own intent.
 */
export const contentClusters: Record<ContentPlatform, ContentCluster> = {
  instagram: { platform: "instagram", label: "Instagram", hubPath: "/instagram-growth-india", hubLabel: "Instagram growth hub", serviceLinks: [{ label: "Instagram follower packages", href: "/buy-instagram-followers-india" }, { label: "Instagram likes for public posts", href: "/instagram-likes" }, { label: "Instagram views and Reels support", href: "/instagram-views" }] },
  youtube: { platform: "youtube", label: "YouTube", hubPath: "/youtube-growth-india", hubLabel: "YouTube growth hub", serviceLinks: [{ label: "YouTube subscriber packages", href: "/youtube-subscribers" }, { label: "YouTube views for public videos", href: "/youtube-views" }, { label: "YouTube watch hours", href: "/buy-youtube-watch-hours-india" }] },
  linkedin: { platform: "linkedin", label: "LinkedIn", hubPath: "/linkedin-growth-india", hubLabel: "LinkedIn growth hub", serviceLinks: [{ label: "LinkedIn follower options", href: "/linkedin-followers" }, { label: "LinkedIn likes for public posts", href: "/linkedin-likes" }] },
  twitter: { platform: "twitter", label: "X / Twitter", hubPath: "/x-growth-india", hubLabel: "X / Twitter growth hub", serviceLinks: [{ label: "X follower options", href: "/twitter-followers" }] },
  facebook: { platform: "facebook", label: "Facebook", hubPath: "/facebook-growth-india", hubLabel: "Facebook growth hub", serviceLinks: [{ label: "Facebook follower options in India", href: "/buy-facebook-followers-india" }, { label: "Facebook likes for public posts", href: "/facebook-likes" }] },
  tiktok: { platform: "tiktok", label: "TikTok", hubPath: "/tiktok-growth-india", hubLabel: "TikTok growth hub", serviceLinks: [{ label: "TikTok follower options", href: "/tiktok-followers" }] },
};

export function getContentCluster(platform: ContentPlatform | null) {
  return platform ? contentClusters[platform] : null;
}

export function isContentClusterPath(path: string) {
  return Object.values(contentClusters).some((cluster) => cluster.hubPath === path);
}
