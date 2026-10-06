import {
  absoluteSeoUrl,
  canPublishCountryServicePage,
  countryHubAlternates,
  countryServiceAlternates,
  createCountryHubMetadata,
  createCountryServiceMetadata,
  internationalMarkets,
  publishedCountryServicePages,
  type PublishedCountryServicePage,
} from "./international.ts";

export const internationalXDefaultPolicy = {
  enabled: false,
  fallbackPath: null,
  reason:
    "SocialRUSH does not currently have a neutral international fallback page that is equivalent to every localized hub/service. Do not point x-default at an India-specific or non-equivalent URL.",
} as const;

export type InternationalMarketLink = Readonly<{
  marketName: string;
  searchLabel: string;
  hreflang: string;
  href: string;
}>;

export function getCountryServiceMarketLinks(
  page: PublishedCountryServicePage,
): readonly InternationalMarketLink[] {
  return publishedCountryServicePages
    .filter(
      (candidate) =>
        candidate.catalogServiceCode === page.catalogServiceCode &&
        candidate.market.slug !== page.market.slug &&
        canPublishCountryServicePage(candidate),
    )
    .map((candidate) => ({
      marketName: candidate.market.name,
      searchLabel: candidate.market.searchLabel,
      hreflang: candidate.market.hreflang,
      href: absoluteSeoUrl(`/${candidate.market.slug}/${candidate.serviceSlug}`),
    }));
}

export function buildInternationalSeoSnapshot() {
  const issues: string[] = [];
  const hubAlternates = countryHubAlternates();
  const hubTitles = new Set<string>();
  const hubDescriptions = new Set<string>();

  for (const market of internationalMarkets) {
    const path = `/${market.slug}`;
    const metadata = createCountryHubMetadata(market);
    const title = (metadata.title as { absolute?: string } | undefined)?.absolute ?? "";
    const description = String(metadata.description ?? "");
    const languages = metadata.alternates?.languages ?? {};

    if (metadata.alternates?.canonical !== absoluteSeoUrl(path)) {
      issues.push(`${path}: hub canonical is not self-referencing`);
    }
    if (languages[market.hreflang] !== absoluteSeoUrl(path)) {
      issues.push(`${path}: hub hreflang cluster is missing its self-reference`);
    }
    if (Object.keys(languages).length !== internationalMarkets.length) {
      issues.push(`${path}: hub hreflang cluster does not contain every published market hub`);
    }
    if (title && hubTitles.has(title)) issues.push(`${path}: duplicate hub title`);
    if (description && hubDescriptions.has(description)) issues.push(`${path}: duplicate hub description`);
    hubTitles.add(title);
    hubDescriptions.add(description);
  }

  const serviceCodes = [...new Set(publishedCountryServicePages.map((page) => page.catalogServiceCode))];
  const equivalentServiceClusters = serviceCodes.map((catalogServiceCode) => {
    const pages = publishedCountryServicePages.filter(
      (page) => page.catalogServiceCode === catalogServiceCode && canPublishCountryServicePage(page),
    );

    for (const page of pages) {
      const path = `/${page.market.slug}/${page.serviceSlug}`;
      const metadata = createCountryServiceMetadata(page);
      const alternates = countryServiceAlternates(page);

      if (metadata.alternates?.canonical !== absoluteSeoUrl(path)) {
        issues.push(`${path}: service canonical is not self-referencing`);
      }
      if (alternates[page.market.hreflang] !== absoluteSeoUrl(path)) {
        issues.push(`${path}: service hreflang cluster is missing its self-reference`);
      }
      if (Object.keys(alternates).length !== pages.length) {
        issues.push(`${path}: service hreflang cluster contains a non-equivalent or misses an equivalent market page`);
      }
      if (Object.prototype.hasOwnProperty.call(alternates, "x-default")) {
        issues.push(`${path}: x-default is present without a neutral equivalent fallback`);
      }
      if (!page.copy.intentTitle || !page.copy.intentSummary || page.copy.planningChecks?.length !== 3) {
        issues.push(`${path}: localized service page is missing distinct market-planning content`);
      }
      if (!page.copy.intentSummary?.includes(page.market.audience)) {
        issues.push(`${path}: localized service summary does not include the market audience context`);
      }
      if (!page.copy.planningChecks?.[0]?.includes(page.market.currency)) {
        issues.push(`${path}: localized service planning checks do not include the market currency context`);
      }

      const userLinks = getCountryServiceMarketLinks(page);
      if (userLinks.some((link) => link.href === absoluteSeoUrl(path))) {
        issues.push(`${path}: user-facing market switcher incorrectly includes the current page`);
      }
      if (userLinks.length !== Math.max(0, pages.length - 1)) {
        issues.push(`${path}: user-facing market switcher does not match the real equivalent-page inventory`);
      }
    }

    return {
      catalogServiceCode,
      pages: pages.map((page) => ({
        market: page.market.name,
        marketSlug: page.market.slug,
        hreflang: page.market.hreflang,
        path: `/${page.market.slug}/${page.serviceSlug}`,
      })),
    };
  });

  if (Object.prototype.hasOwnProperty.call(hubAlternates, "x-default")) {
    issues.push("country hubs: x-default is present without a neutral equivalent fallback");
  }

  const markets = internationalMarkets.map((market) => {
    const pages = publishedCountryServicePages.filter(
      (page) => page.market.slug === market.slug && canPublishCountryServicePage(page),
    );
    return {
      slug: market.slug,
      name: market.name,
      hreflang: market.hreflang,
      currency: market.currency,
      hubPath: `/${market.slug}`,
      serviceCount: pages.length,
      services: pages.map((page) => ({
        label: page.h1,
        path: `/${market.slug}/${page.serviceSlug}`,
        catalogServiceCode: page.catalogServiceCode,
      })),
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    markets,
    equivalentServiceClusters,
    issues,
    xDefaultPolicy: internationalXDefaultPolicy,
    summary: {
      markets: markets.length,
      localizedServicePages: publishedCountryServicePages.filter(canPublishCountryServicePage).length,
      equivalentServiceClusters: equivalentServiceClusters.length,
      issues: issues.length,
    },
    note:
      "International pages are explicitly allowlisted. Phase 40 does not auto-generate country/service combinations, invent local availability, or create x-default tags until a genuinely neutral equivalent fallback exists.",
  };
}
