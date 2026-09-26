import type { SmmService } from "../smm-service-catalog.ts";
import { buildQuantityPlanning } from "./search-demand.ts";

export type PricingAuthorityDefinition = {
  code: string;
  platformLabel: string;
  serviceName: string;
  servicePath: string;
  guidePath?: string;
};

export const pricingAuthorityDefinitions: readonly PricingAuthorityDefinition[] = [
  {
    code: "instagram-followers",
    platformLabel: "Instagram",
    serviceName: "Instagram Followers",
    servicePath: "/buy-instagram-followers-india",
    guidePath: "/blog/instagram-followers-price-in-india",
  },
  {
    code: "youtube-subscribers",
    platformLabel: "YouTube",
    serviceName: "YouTube Subscribers",
    servicePath: "/youtube-subscribers",
    guidePath: "/blog/youtube-subscribers-price-in-india",
  },
  {
    code: "linkedin-followers",
    platformLabel: "LinkedIn",
    serviceName: "LinkedIn Followers",
    servicePath: "/linkedin-followers",
    guidePath: "/blog/linkedin-followers-price-in-india",
  },
  {
    code: "facebook-followers",
    platformLabel: "Facebook",
    serviceName: "Facebook Followers",
    servicePath: "/buy-facebook-followers-india",
    guidePath: "/blog/facebook-followers-price-in-india",
  },
  {
    code: "x-followers",
    platformLabel: "X / Twitter",
    serviceName: "Twitter / X Followers",
    servicePath: "/twitter-followers",
    guidePath: "/blog/twitter-followers-price-in-india",
  },
  {
    code: "telegram-members",
    platformLabel: "Telegram",
    serviceName: "Telegram Members",
    servicePath: "/telegram-members",
    guidePath: "/blog/telegram-members-price-in-india",
  },
  {
    code: "tiktok-followers",
    platformLabel: "TikTok",
    serviceName: "TikTok Followers",
    servicePath: "/tiktok-followers",
  },
] as const;

type PricingCatalogItem = Pick<SmmService, "code" | "pricePer1000">;

export function buildPricingAuthorityEntries(catalog: readonly PricingCatalogItem[]) {
  return pricingAuthorityDefinitions.map((definition) => {
    const service = catalog.find((candidate) => candidate.code === definition.code);
    const rate = service && Number.isFinite(service.pricePer1000) && service.pricePer1000 > 0
      ? service.pricePer1000
      : null;
    return {
      ...definition,
      pricePer1000: rate,
      planning: buildQuantityPlanning(rate, [1000, 5000]),
    };
  });
}
