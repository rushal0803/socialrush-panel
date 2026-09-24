import { activeSmmServices, type SmmPlatformId, type SmmService } from "./smm-service-catalog";

export type LiveServiceSyncDefinition = {
  code: SmmService["code"];
  platform: SmmPlatformId;
  name: string;
  description: string;
  databaseName: string;
  access: "client" | "protected";
  fallbackInstruction: string;
  requireLiveFacts: boolean;
};

const protectedCodes = new Set<SmmService["code"]>([
  "youtube-comments",
  "youtube-watch-hours",
  "facebook-group-members",
]);

const databaseNameOverrides: Partial<Record<SmmService["code"], string>> = {
  "instagram-followers": "Instagram Real Followers",
  "linkedin-followers": "LinkedIn Profile Followers",
  "x-followers": "X Followers",
};

const fallbackInstructionOverrides: Partial<Record<SmmService["code"], string>> = {
  "instagram-followers": "Use a public Instagram profile URL.",
  "instagram-saves": "Use a public Instagram post or reel URL.",
  "instagram-shares": "Use a public Instagram post or reel URL.",
  "linkedin-followers": "Use a public LinkedIn profile or company URL.",
  "x-followers": "Use a public X or Twitter profile URL.",
};

const liveCodes = new Set<SmmService["code"]>([
  "instagram-followers",
  "instagram-saves",
  "instagram-shares",
  "youtube-comments",
  "youtube-watch-hours",
  "facebook-group-members",
  "linkedin-followers",
  "linkedin-usa-connections",
  "linkedin-usa-post-likes",
  "linkedin-usa-endorsements",
  "linkedin-usa-followers",
  "linkedin-usa-group-members",
  "linkedin-usa-custom-comments",
  "linkedin-usa-reposts",
  "x-followers",
  "twitter-likes",
  "twitter-views",
  "twitter-retweets",
  "twitter-crypto-followers",
  "twitter-crypto-likes",
  "twitter-crypto-retweets",
  "twitter-crypto-custom-comments",
  "telegram-post-views",
  "telegram-post-reactions",
  "telegram-poll-votes",
  "tiktok-followers",
  "tiktok-likes",
  "tiktok-views",
  "tiktok-custom-comments",
  "tiktok-story-views",
  "tiktok-saves",
]);

export const liveServiceSyncDefinitions: LiveServiceSyncDefinition[] = activeSmmServices
  .filter((service) => liveCodes.has(service.code))
  .map((service) => ({
    code: service.code,
    platform: service.platform,
    name: service.name,
    description: service.description,
    databaseName: databaseNameOverrides[service.code] ?? service.name,
    access: protectedCodes.has(service.code) ? "protected" : "client",
    fallbackInstruction:
      fallbackInstructionOverrides[service.code] ??
      service.importantInstruction ??
      "Use the correct public link required by this service.",
    requireLiveFacts: Boolean(service.requiresLiveCatalogFacts),
  }));

export const protectedLiveServiceDefinitions = liveServiceSyncDefinitions.filter(
  (service) => service.access === "protected",
);

export const clientLiveServiceDefinitions = liveServiceSyncDefinitions.filter(
  (service) => service.access === "client",
);

export const liveServiceCodes = new Set(liveServiceSyncDefinitions.map((service) => service.code));

export function shouldHideWithoutLiveFacts(service: SmmService) {
  return Boolean(service.requiresLiveCatalogFacts);
}
