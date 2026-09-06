import type { Metadata } from "next";
import type { Currency } from "@/lib/currency";
import { SEO_SITE_URL } from "./metadata.ts";
import { activeSmmServices, type SmmPlatformId } from "../smm-service-catalog.ts";
import type { ServiceCode } from "../service-pricing.ts";

export type InternationalMarket = {
  code: "US" | "GB" | "CA" | "AU" | "AE" | "SG";
  slug: "us" | "uk" | "ca" | "au" | "ae" | "sg";
  name: string;
  hreflang: "en-US" | "en-GB" | "en-CA" | "en-AU" | "en-AE" | "en-SG";
  currency: Currency;
  audience: string;
  emphasis: string;
  paymentNote: string;
  faq: { question: string; answer: string };
  enabled: true;
  indexable: true;
};

// India remains on its established root URLs. It is deliberately not a /in/
// market and does not belong in this hub-only alternate cluster.
export const internationalMarkets = [
  { code: "US", slug: "us", name: "United States", hreflang: "en-US", currency: "USD", audience: "creators, brands and teams planning campaigns for US-facing audiences", emphasis: "campaign planning across creator, brand and business social channels", paymentNote: "Prices can be displayed in US dollars for planning; checkout is processed in INR.", faq: { question: "Can I view SocialRUSH pricing in US dollars?", answer: "Yes. This page can set US dollar display pricing for planning. The final checkout remains INR-denominated." }, enabled: true, indexable: true },
  { code: "GB", slug: "uk", name: "United Kingdom", hreflang: "en-GB", currency: "GBP", audience: "UK creators, brands and independent marketing teams", emphasis: "clear service comparison before a campaign is selected", paymentNote: "Prices can be displayed in pounds sterling for planning; checkout is processed in INR.", faq: { question: "Does the UK hub change how an order is placed?", answer: "No. It helps UK visitors discover services and review pound-sterling display estimates; public-link ordering and checkout terms remain the same." }, enabled: true, indexable: true },
  { code: "CA", slug: "ca", name: "Canada", hreflang: "en-CA", currency: "CAD", audience: "Canadian creators, small businesses and social media teams", emphasis: "organizing service discovery around a practical campaign objective", paymentNote: "Prices can be displayed in Canadian dollars for planning; checkout is processed in INR.", faq: { question: "Are Canadian-dollar prices final checkout prices?", answer: "No. They are display estimates to make planning easier. Checkout is processed in INR." }, enabled: true, indexable: true },
  { code: "AU", slug: "au", name: "Australia", hreflang: "en-AU", currency: "AUD", audience: "Australian creators, businesses and agencies", emphasis: "comparing available platform services with transparent campaign details", paymentNote: "Prices can be displayed in Australian dollars for planning; checkout is processed in INR.", faq: { question: "Can Australian visitors use this hub to compare services?", answer: "Yes. Use it to discover supported platforms, compare current options and see Australian-dollar display estimates before ordering." }, enabled: true, indexable: true },
  { code: "AE", slug: "ae", name: "United Arab Emirates", hreflang: "en-AE", currency: "AED", audience: "UAE creators, brands and businesses managing public social profiles", emphasis: "reviewing clear service information before a campaign begins", paymentNote: "Prices can be displayed in UAE dirhams for planning; checkout is processed in INR.", faq: { question: "What does AED display pricing mean?", answer: "It is a planning estimate in UAE dirhams. It does not change the INR checkout currency or payment terms." }, enabled: true, indexable: true },
  { code: "SG", slug: "sg", name: "Singapore", hreflang: "en-SG", currency: "SGD", audience: "Singapore creators, startups and regional marketing teams", emphasis: "keeping service discovery and campaign details easy to review", paymentNote: "Prices can be displayed in Singapore dollars for planning; checkout is processed in INR.", faq: { question: "Does the Singapore hub offer a separate checkout?", answer: "No. It provides a Singapore-focused discovery page and SGD display estimates while checkout continues in INR." }, enabled: true, indexable: true },
] as const satisfies readonly InternationalMarket[];

export const internationalHubPaths = internationalMarkets.filter((market) => market.enabled && market.indexable).map((market) => `/${market.slug}`);

export function getInternationalMarket(slug: string) {
  return internationalMarkets.find((market) => market.slug === slug && market.enabled && market.indexable);
}

export function absoluteSeoUrl(path: string) {
  return new URL(path, `${SEO_SITE_URL}/`).toString();
}

export function countryHubAlternates() {
  return Object.fromEntries(internationalMarkets.filter((market) => market.enabled && market.indexable).map((market) => [market.hreflang, absoluteSeoUrl(`/${market.slug}`)]));
}

export function createCountryHubMetadata(market: InternationalMarket): Metadata {
  const path = `/${market.slug}`;
  const url = absoluteSeoUrl(path);
  const title = `Social Media Growth Services in the ${market.name}`;
  const description = `Explore SocialRUSH social media growth services for ${market.audience}. Compare supported platforms, transparent service details and local-currency display estimates.`;
  return {
    title,
    description,
    alternates: { canonical: url, languages: countryHubAlternates() },
    openGraph: { type: "website", locale: market.hreflang.replace("-", "_"), siteName: "SocialRUSH", title: `${title} | SocialRUSH`, description, url, images: [{ url: absoluteSeoUrl("/og-image.png"), width: 1200, height: 630, alt: "SocialRUSH social media growth services" }] },
    twitter: { card: "summary_large_image", title: `${title} | SocialRUSH`, description, images: [absoluteSeoUrl("/og-image.png")] },
    robots: { index: true, follow: true },
  };
}

// Foundation for Phase 6. A route is publishable only when it has unique copy
// and an explicitly enabled configuration; this phase intentionally creates none.
export type CountryServicePageConfig = { market: InternationalMarket; serviceSlug: string; title: string; description: string; h1: string; intro: string; enabled: boolean; indexable: boolean };
export function canPublishCountryServicePage(config: CountryServicePageConfig) {
  return config.enabled && config.indexable && Boolean(config.title && config.description && config.h1 && config.intro);
}

type CountryServiceCopy = { useCase: string; consideration: string; faq: string };
export type PublishedCountryServicePage = CountryServicePageConfig & { platform: SmmPlatformId; catalogServiceCode: ServiceCode; copy: CountryServiceCopy };
const page = (marketSlug: InternationalMarket["slug"], serviceSlug: string, catalogServiceCode: ServiceCode, copy: CountryServiceCopy): PublishedCountryServicePage => {
  const market = getInternationalMarket(marketSlug)!; const service = activeSmmServices.find((candidate) => candidate.code === catalogServiceCode)!; const label = service.name.replace("Profile ", "");
  return { market, serviceSlug, catalogServiceCode, platform: service.platform, enabled: true, indexable: true, title: `Buy ${label} in the ${market.name} | SocialRUSH`, description: `Buy ${label} for a public ${service.platform} destination in the ${market.name}. Review quantity rules, delivery information and ${market.currency} display estimates before INR checkout.`, h1: `Buy ${label} in the ${market.name}`, intro: `Choose a valid ${label.toLowerCase()} package, add the correct public link, and review the total before continuing to the secure order flow. ${copy.useCase}`, copy };
};
// Explicit first-wave allowlist. Do not infer routes from the catalog or markets.
export const publishedCountryServicePages = [
  page("us", "buy-instagram-followers", "instagram-followers", { useCase: "US creators and brands can use it when planning a visible profile campaign alongside their own content work.", consideration: "US visitors see USD estimates for planning, while the final payment is settled in INR.", faq: "Use the public Instagram profile URL for the account receiving the order." }),
  page("us", "buy-youtube-subscribers", "youtube-subscribers", { useCase: "It suits a public channel campaign where the channel URL and package size are already clear.", consideration: "Review the channel URL carefully before handing the order to the dashboard.", faq: "Use a public YouTube channel, handle, or channel-ID URL; a video URL is not enough." }),
  page("us", "buy-youtube-views", "youtube-views", { useCase: "US video teams can use it to plan discovery around one public video or Short.", consideration: "Keep the selected video public while the campaign is being processed.", faq: "Provide the exact public YouTube video or Short link for this service." }),
  page("us", "buy-linkedin-followers", "linkedin-followers", { useCase: "It is designed for professionals and company teams preparing a public-profile campaign.", consideration: "Check that the LinkedIn profile or company page remains publicly accessible.", faq: "A public LinkedIn profile or company-page URL is required; no password is needed." }),
  page("uk", "buy-instagram-followers", "instagram-followers", { useCase: "UK creators and independent teams can compare a package before adding their public profile link.", consideration: "Pound-sterling estimates help with planning, but the checkout amount remains INR.", faq: "Enter the public Instagram profile URL exactly as it appears in the browser." }),
  page("uk", "buy-youtube-subscribers", "youtube-subscribers", { useCase: "For UK channel owners, the page keeps package selection and public-channel requirements in one place.", consideration: "Confirm your channel link before moving into the order dashboard.", faq: "Use a public channel or handle URL, not a private Studio link." }),
  page("ca", "buy-instagram-followers", "instagram-followers", { useCase: "Canadian creators and small businesses can assess a profile package without changing the established ordering flow.", consideration: "CAD figures are display estimates only, so review the INR checkout total before payment.", faq: "The profile must be public and accessible for the order to be processed." }),
  page("au", "buy-instagram-followers", "instagram-followers", { useCase: "Australian businesses and creators can choose a package that matches a public-profile campaign.", consideration: "AUD display pricing is a planning convenience and does not create a separate local payment flow.", faq: "Use the profile URL, not your Instagram login details or a password." }),
] as const;
export const countryServicePaths = publishedCountryServicePages.filter(canPublishCountryServicePage).map((config) => `/${config.market.slug}/${config.serviceSlug}`);
export function getPublishedCountryServicePage(marketSlug: string, serviceSlug: string) { return publishedCountryServicePages.find((config) => config.market.slug === marketSlug && config.serviceSlug === serviceSlug && canPublishCountryServicePage(config)); }
export function countryServiceAlternates(config: PublishedCountryServicePage) { return Object.fromEntries(publishedCountryServicePages.filter((candidate) => candidate.catalogServiceCode === config.catalogServiceCode && canPublishCountryServicePage(candidate)).map((candidate) => [candidate.market.hreflang, absoluteSeoUrl(`/${candidate.market.slug}/${candidate.serviceSlug}`)])); }
export function createCountryServiceMetadata(config: PublishedCountryServicePage): Metadata {
  const path = `/${config.market.slug}/${config.serviceSlug}`;
  const url = absoluteSeoUrl(path);
  const imageUrl = absoluteSeoUrl("/og-image.png");

  return {
    title: { absolute: config.title },
    description: config.description,
    alternates: { canonical: url, languages: countryServiceAlternates(config) },
    openGraph: {
      type: "website",
      locale: config.market.hreflang.replace("-", "_"),
      siteName: "SocialRUSH",
      title: config.title,
      description: config.description,
      url,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `SocialRUSH ${config.h1}` }],
    },
    twitter: { card: "summary_large_image", title: config.title, description: config.description, images: [imageUrl] },
    robots: { index: true, follow: true },
  };
}
