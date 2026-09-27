export const PHASE5_SIGNIFICANT_UPDATE = "2026-09-27";

const phase5UpdatedPaths = [
  "/",
  "/services",
  "/for-agencies",
  "/pricing",
  "/blog",
  "/tools",
  "/tools/social-media-service-cost-calculator",
  "/instagram-growth-india",
  "/youtube-growth-india",
  "/facebook-growth-india",
  "/linkedin-growth-india",
  "/x-growth-india",
  "/tiktok-growth-india",
  "/buy-instagram-followers-india",
  "/instagram-likes",
  "/instagram-views",
  "/buy-instagram-comments-india",
  "/buy-instagram-saves-india",
  "/buy-instagram-shares-india",
  "/youtube-subscribers",
  "/youtube-likes",
  "/youtube-views",
  "/buy-youtube-comments-india",
  "/buy-youtube-watch-hours-india",
  "/linkedin-followers",
  "/linkedin-likes",
  "/twitter-followers",
  "/buy-facebook-followers-india",
  "/buy-facebook-group-members-india",
  "/facebook-likes",
  "/facebook-views",
  "/telegram-members",
  "/tiktok-followers",
  "/blog/youtube-subscribers-price-in-india",
  "/blog/linkedin-followers-price-in-india",
  "/blog/facebook-followers-price-in-india",
  "/blog/twitter-followers-price-in-india",
  "/blog/telegram-members-price-in-india",
  "/blog/is-it-safe-to-buy-youtube-subscribers",
  "/blog/is-it-safe-to-buy-youtube-views",
  "/blog/is-it-safe-to-buy-linkedin-followers",
  "/blog/is-it-safe-to-buy-twitter-followers",
  "/blog/is-it-safe-to-buy-telegram-members",
] as const;

export const phase5SearchFreshnessPaths = phase5UpdatedPaths;

export const searchFreshnessLastmod: Readonly<Record<string, string>> =
  Object.fromEntries(
    phase5UpdatedPaths.map((path) => [path, PHASE5_SIGNIFICANT_UPDATE]),
  );
