import { internationalMarkets, publishedCountryServicePages } from "./international";

export type InternationalAuthorityMarket = {
  slug: string;
  name: string;
  searchLabel: string;
  currency: string;
  hubHref: string;
  services: ReadonlyArray<{ label: string; href: string }>;
};

function serviceLabel(code: string) {
  if (code === "instagram-followers") return "Instagram followers";
  if (code === "youtube-subscribers") return "YouTube subscribers";
  if (code === "youtube-views") return "YouTube views";
  if (code === "linkedin-followers") return "LinkedIn followers";
  return code.replaceAll("-", " ");
}

export const internationalAuthorityMarkets: readonly InternationalAuthorityMarket[] =
  internationalMarkets.map((market) => ({
    slug: market.slug,
    name: market.name,
    searchLabel: market.searchLabel,
    currency: market.currency,
    hubHref: `/${market.slug}`,
    services: publishedCountryServicePages
      .filter((page) => page.market.slug === market.slug)
      .map((page) => ({
        label: serviceLabel(page.catalogServiceCode),
        href: `/${market.slug}/${page.serviceSlug}`,
      })),
  }));

export function hasUniqueInternationalAuthorityLinks(
  markets = internationalAuthorityMarkets,
) {
  const links = markets.flatMap((market) => [
    market.hubHref,
    ...market.services.map((service) => service.href),
  ]);

  return new Set(links).size === links.length;
}
