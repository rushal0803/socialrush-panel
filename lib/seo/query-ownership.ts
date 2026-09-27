import { canonicalIndiaServicePaths } from "./india-service-pages";

export type QueryOwner = Readonly<{
  id: string;
  canonicalPath: string;
  intent: string;
  aliases: readonly string[];
}>;

export const transactionalQueryOwners: readonly QueryOwner[] = [
  {
    id: "instagram-followers-india",
    canonicalPath: canonicalIndiaServicePaths["buy-instagram-followers-india"],
    intent: "buy Instagram followers in India",
    aliases: [
      "/buy-instagram-followers",
      "/instagram-followers",
      "/services/instagram-audience-growth",
      "/services/instagram-followers",
    ],
  },
  {
    id: "instagram-likes-india",
    canonicalPath: canonicalIndiaServicePaths["buy-instagram-likes-india"],
    intent: "buy Instagram likes in India",
    aliases: [
      "/buy-instagram-likes-india",
      "/services/instagram-engagement-boost",
      "/services/instagram-likes",
    ],
  },
  {
    id: "instagram-views-india",
    canonicalPath: canonicalIndiaServicePaths["buy-instagram-views-india"],
    intent: "buy Instagram views in India",
    aliases: [
      "/buy-instagram-views-india",
      "/services/instagram-content-reach",
      "/services/instagram-views",
    ],
  },
  {
    id: "instagram-comments-india",
    canonicalPath: canonicalIndiaServicePaths["buy-instagram-comments-india"],
    intent: "buy Instagram comments in India",
    aliases: [],
  },
  {
    id: "instagram-saves-india",
    canonicalPath: canonicalIndiaServicePaths["buy-instagram-saves-india"],
    intent: "buy Instagram saves in India",
    aliases: [],
  },
  {
    id: "instagram-shares-india",
    canonicalPath: canonicalIndiaServicePaths["buy-instagram-shares-india"],
    intent: "buy Instagram shares in India",
    aliases: [],
  },
  {
    id: "youtube-subscribers-india",
    canonicalPath: canonicalIndiaServicePaths["buy-youtube-subscribers-india"],
    intent: "buy YouTube subscribers in India",
    aliases: [
      "/buy-youtube-subscribers-india",
      "/services/youtube-channel-growth",
      "/services/youtube-subscribers",
    ],
  },
  {
    id: "youtube-likes-india",
    canonicalPath: canonicalIndiaServicePaths["buy-youtube-likes-india"],
    intent: "buy YouTube likes in India",
    aliases: ["/buy-youtube-likes-india", "/services/youtube-likes"],
  },
  {
    id: "youtube-views-india",
    canonicalPath: canonicalIndiaServicePaths["buy-youtube-views-india"],
    intent: "buy YouTube views in India",
    aliases: [
      "/buy-youtube-views-india",
      "/services/youtube-video-promotion",
      "/services/youtube-views",
    ],
  },
  {
    id: "youtube-watch-hours-india",
    canonicalPath: "/buy-youtube-watch-hours-india",
    intent: "buy YouTube watch hours in India",
    aliases: ["/youtube-watch-hours"],
  },
  {
    id: "youtube-comments-india",
    canonicalPath: canonicalIndiaServicePaths["buy-youtube-comments-india"],
    intent: "buy YouTube comments in India",
    aliases: [],
  },
  {
    id: "linkedin-followers-india",
    canonicalPath: canonicalIndiaServicePaths["buy-linkedin-followers-india"],
    intent: "buy LinkedIn followers in India",
    aliases: [
      "/buy-linkedin-followers-india",
      "/services/linkedin-followers",
      "/services/linkedin-professional-growth",
    ],
  },
  {
    id: "linkedin-likes-india",
    canonicalPath: canonicalIndiaServicePaths["buy-linkedin-likes-india"],
    intent: "buy LinkedIn likes in India",
    aliases: ["/buy-linkedin-likes-india", "/services/linkedin-likes"],
  },
  {
    id: "twitter-followers-india",
    canonicalPath: canonicalIndiaServicePaths["buy-twitter-followers-india"],
    intent: "buy Twitter or X followers in India",
    aliases: [
      "/buy-twitter-followers-india",
      "/x-followers",
      "/buy-x-followers",
      "/buy-x-followers-india",
      "/services/x-authority-growth",
      "/services/x-followers",
    ],
  },
  {
    id: "facebook-followers-india",
    canonicalPath: canonicalIndiaServicePaths["buy-facebook-followers-india"],
    intent: "buy Facebook followers in India",
    aliases: [
      "/facebook-followers",
      "/services/facebook-brand-engagement",
      "/services/facebook-followers",
    ],
  },
  {
    id: "facebook-group-members-india",
    canonicalPath: canonicalIndiaServicePaths["buy-facebook-group-members-india"],
    intent: "buy Facebook group members in India",
    aliases: [],
  },
  {
    id: "facebook-likes-india",
    canonicalPath: canonicalIndiaServicePaths["buy-facebook-likes-india"],
    intent: "buy Facebook likes in India",
    aliases: ["/buy-facebook-likes-india", "/services/facebook-likes"],
  },
  {
    id: "facebook-views-india",
    canonicalPath: canonicalIndiaServicePaths["buy-facebook-views-india"],
    intent: "buy Facebook views in India",
    aliases: ["/buy-facebook-views-india", "/services/facebook-views"],
  },
  {
    id: "facebook-shares-india",
    canonicalPath: canonicalIndiaServicePaths["buy-facebook-shares-india"],
    intent: "buy Facebook shares in India",
    aliases: ["/services/facebook-shares"],
  },
  {
    id: "telegram-members-india",
    canonicalPath: canonicalIndiaServicePaths["buy-telegram-members-india"],
    intent: "buy Telegram members in India",
    aliases: ["/buy-telegram-members-india", "/services/telegram-members"],
  },
  {
    id: "tiktok-followers-india",
    canonicalPath: canonicalIndiaServicePaths["buy-tiktok-followers-india"],
    intent: "buy TikTok followers in India",
    aliases: ["/buy-tiktok-followers-india", "/services/tiktok-followers"],
  },
  {
    id: "social-media-services-india",
    canonicalPath: "/services",
    intent: "SMM panel India and multi-platform service catalog comparison",
    aliases: ["/services/smm-panel-india", "/smm-panel-india", "/social-media-services-india", "/best-smm-panel-india", "/reliable-smm-panel-india", "/trusted-smm-panel-india"],
  },
  {
    id: "social-media-growth-services-india",
    canonicalPath: "/social-media-growth-india",
    intent: "social media growth, engagement and promotion services India",
    aliases: [
      "/social-media-growth-services-india",
      "/social-media-growth-service-india",
      "/social-media-engagement-services-india",
      "/social-media-engagement-service-india",
      "/social-media-promotion-services-india",
      "/social-media-promotion-service-india",
    ],
  },
  {
    id: "instagram-smm-panel-india",
    canonicalPath: "/instagram-growth-india",
    intent: "Instagram SMM panel India and multi-service Instagram discovery",
    aliases: ["/instagram-smm-panel-india", "/smm-panel-for-instagram-india"],
  },
  {
    id: "youtube-smm-panel-india",
    canonicalPath: "/youtube-growth-india",
    intent: "YouTube SMM panel India and multi-service YouTube discovery",
    aliases: ["/youtube-smm-panel-india", "/smm-panel-for-youtube-india"],
  },
  {
    id: "linkedin-smm-panel-india",
    canonicalPath: "/linkedin-growth-india",
    intent: "LinkedIn SMM panel India and multi-service LinkedIn discovery",
    aliases: ["/linkedin-smm-panel-india", "/smm-panel-for-linkedin-india"],
  },
  {
    id: "facebook-smm-panel-india",
    canonicalPath: "/facebook-growth-india",
    intent: "Facebook SMM panel India and multi-service Facebook discovery",
    aliases: ["/facebook-smm-panel-india", "/smm-panel-for-facebook-india"],
  },
  {
    id: "twitter-smm-panel-india",
    canonicalPath: "/x-growth-india",
    intent: "Twitter or X SMM panel India and multi-service X discovery",
    aliases: ["/twitter-smm-panel-india", "/x-smm-panel-india"],
  },
  {
    id: "tiktok-smm-panel-india",
    canonicalPath: "/tiktok-growth-india",
    intent: "TikTok SMM panel India and multi-service TikTok discovery",
    aliases: ["/tiktok-smm-panel-india", "/smm-panel-for-tiktok-india"],
  },
  {
    id: "telegram-smm-panel-india",
    canonicalPath: "/services/telegram",
    intent: "Telegram SMM panel India and multi-service Telegram discovery",
    aliases: ["/telegram-smm-panel-india", "/smm-panel-for-telegram-india"],
  },
  {
    id: "smm-pricing-india",
    canonicalPath: "/pricing",
    intent: "SMM panel price list India, INR pricing and UPI payment comparison",
    aliases: [
      "/smm-panel-price-list-india",
      "/smm-panel-pricing-india",
      "/smm-panel-rates-india",
      "/upi-smm-panel-india",
      "/smm-panel-with-upi-india",
    ],
  },
  {
    id: "agency-reseller-panel-india",
    canonicalPath: "/for-agencies",
    intent: "SMM reseller panel India and SMM panel for agencies India",
    aliases: ["/smm-reseller-panel-india", "/smm-panel-for-agencies-india"],
  },
] as const;

export const commercialCanonicalRedirects: Readonly<Record<string, string>> =
  Object.fromEntries(
    transactionalQueryOwners.flatMap((owner) =>
      owner.aliases.map((alias) => [alias, owner.canonicalPath] as const),
    ),
  );

export const commercialAliasPaths = Object.keys(commercialCanonicalRedirects);

export function canonicalOwnerForPath(path: string) {
  return transactionalQueryOwners.find(
    (owner) => owner.canonicalPath === path || owner.aliases.includes(path),
  );
}

export function isCommercialAliasPath(path: string) {
  return Object.prototype.hasOwnProperty.call(commercialCanonicalRedirects, path);
}

export function hasUniqueQueryOwnership() {
  const canonicalPaths = transactionalQueryOwners.map((owner) => owner.canonicalPath);
  const aliasPaths = transactionalQueryOwners.flatMap((owner) => owner.aliases);

  return (
    new Set(canonicalPaths).size === canonicalPaths.length &&
    new Set(aliasPaths).size === aliasPaths.length &&
    aliasPaths.every((alias) => !canonicalPaths.includes(alias))
  );
}
