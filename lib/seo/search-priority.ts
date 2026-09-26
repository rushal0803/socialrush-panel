import { canonicalIndiaServicePaths, type IndiaServiceSlug } from "./india-service-pages";

export type SearchPriorityTarget = Readonly<{
  slug: IndiaServiceSlug;
  label: string;
  intent: string;
}>;

export const searchPriorityTargets: readonly SearchPriorityTarget[] = [
  { slug: "buy-instagram-followers-india", label: "Instagram Followers India", intent: "live INR follower pricing" },
  { slug: "buy-youtube-subscribers-india", label: "YouTube Subscribers India", intent: "subscriber packages and INR totals" },
  { slug: "buy-linkedin-followers-india", label: "LinkedIn Followers India", intent: "professional follower pricing" },
  { slug: "buy-twitter-followers-india", label: "Twitter / X Followers India", intent: "X follower pricing" },
  { slug: "buy-facebook-followers-india", label: "Facebook Followers India", intent: "page and profile follower pricing" },
  { slug: "buy-telegram-members-india", label: "Telegram Members India", intent: "member pricing and public-link ordering" },
  { slug: "buy-instagram-likes-india", label: "Instagram Likes India", intent: "post and Reel like pricing" },
  { slug: "buy-youtube-views-india", label: "YouTube Views India", intent: "video view pricing" },
] as const;

export const crawlPriorityServiceLinks = searchPriorityTargets.map((target) => ({
  ...target,
  href: canonicalIndiaServicePaths[target.slug],
}));

export const searchPlanningLinks = [
  { href: "/pricing", label: "Compare Live Social Media Pricing", intent: "cross-platform live INR rates" },
  { href: "/tools/social-media-service-cost-calculator", label: "Service Cost Calculator", intent: "quantity-based cost planning" },
] as const;
