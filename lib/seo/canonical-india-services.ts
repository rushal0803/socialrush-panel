export const indiaServiceSlugs = [
  "buy-instagram-followers-india",
  "buy-instagram-likes-india",
  "buy-instagram-views-india",
  "buy-instagram-comments-india",
  "buy-instagram-saves-india",
  "buy-instagram-shares-india",
  "buy-youtube-subscribers-india",
  "buy-youtube-likes-india",
  "buy-youtube-views-india",
  "buy-youtube-comments-india",
  "buy-linkedin-followers-india",
  "buy-linkedin-likes-india",
  "buy-twitter-followers-india",
  "buy-facebook-followers-india",
  "buy-facebook-group-members-india",
  "buy-facebook-likes-india",
  "buy-facebook-views-india",
  "buy-facebook-shares-india",
  "buy-telegram-members-india",
  "buy-tiktok-followers-india",
] as const;

export type IndiaServiceSlug = (typeof indiaServiceSlugs)[number];

export const canonicalIndiaServicePaths: Record<IndiaServiceSlug, string> = {
  "buy-instagram-followers-india": "/buy-instagram-followers-india",
  "buy-instagram-likes-india": "/instagram-likes",
  "buy-instagram-views-india": "/instagram-views",
  "buy-instagram-comments-india": "/buy-instagram-comments-india",
  "buy-instagram-saves-india": "/buy-instagram-saves-india",
  "buy-instagram-shares-india": "/buy-instagram-shares-india",
  "buy-youtube-subscribers-india": "/youtube-subscribers",
  "buy-youtube-likes-india": "/youtube-likes",
  "buy-youtube-views-india": "/youtube-views",
  "buy-youtube-comments-india": "/buy-youtube-comments-india",
  "buy-linkedin-followers-india": "/linkedin-followers",
  "buy-linkedin-likes-india": "/linkedin-likes",
  "buy-twitter-followers-india": "/twitter-followers",
  "buy-facebook-followers-india": "/buy-facebook-followers-india",
  "buy-facebook-group-members-india": "/buy-facebook-group-members-india",
  "buy-facebook-likes-india": "/facebook-likes",
  "buy-facebook-views-india": "/facebook-views",
  "buy-facebook-shares-india": "/buy-facebook-shares-india",
  "buy-telegram-members-india": "/telegram-members",
  "buy-tiktok-followers-india": "/tiktok-followers",
};

export function getCanonicalIndiaServicePath(slug: IndiaServiceSlug) {
  return canonicalIndiaServicePaths[slug];
}
