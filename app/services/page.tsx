import type { Metadata } from "next";
import ServicesPageContent from "@/components/marketing/services/ServicesPageContent";
import ServiceCompareStudio from "@/components/marketing/services/ServiceCompareStudio";
import SmmPanelIndiaAuthority from "@/components/marketing/services/SmmPanelIndiaAuthority";
import SocialMediaServicesIndiaAuthority from "@/components/marketing/services/SocialMediaServicesIndiaAuthority";
import IndiaGrowthDiscovery from "@/components/marketing/IndiaGrowthDiscovery";
import ConversionDecisionBar from "@/components/marketing/ConversionDecisionBar";
import CrawlPriorityLinks from "@/components/seo/CrawlPriorityLinks";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getLiveServiceFacts } from "@/lib/seo/live-service";
import { activeSmmServices, getServiceById, type SmmService } from "@/lib/smm-service-catalog";
import { smmPanelIndiaKeywords } from "@/lib/seo/smm-panel-intent";
import { socialMediaServicesIndiaKeywords } from "@/lib/seo/social-media-services-intent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "SMM Panel India | Social Media Growth Services | SocialRUSH",
  description:
    "Compare SocialRUSH SMM services in India across Instagram, YouTube, Facebook, LinkedIn, Telegram, TikTok and X with INR pricing, UPI checkout, public-link ordering and dashboard tracking.",
  path: "/services",
  keywords: [
    "social media growth services India",
    "buy Instagram followers India",
    "buy YouTube subscribers India",
    "buy Facebook followers India",
    "Instagram growth services India",
    "YouTube growth services India",
    ...smmPanelIndiaKeywords,
    ...socialMediaServicesIndiaKeywords,
  ],
});

const servicesFaqs = [
  {
    question: "Which social media growth services are available in India?",
    answer:
      "SocialRUSH lists services for Instagram, YouTube, Facebook, LinkedIn, Telegram, TikTok and Twitter/X, with public-link ordering and dashboard tracking.",
  },
  {
    question: "Can I compare Instagram, YouTube and Facebook services before ordering?",
    answer:
      "Yes. The Services page links to detailed service pages and packages so you can compare pricing, delivery estimates, refill information and link requirements before ordering.",
  },
  {
    question: "What is an SMM panel in India?",
    answer:
      "An SMM panel is a dashboard for browsing and ordering supported social-media growth services. Useful India-specific comparison points include INR pricing, payment methods, quantity limits, delivery estimates, refill terms, public-link requirements and order tracking.",
  },
  {
    question: "Can I pay for SocialRUSH SMM services with UPI in India?",
    answer:
      "UPI is supported in the SocialRUSH direct checkout flow. Bank Transfer and USDT (TRC20) may also be available. The payment methods and exact amount displayed at checkout are authoritative.",
  },
  {
    question: "Can agencies and resellers use SocialRUSH?",
    answer:
      "Yes. SocialRUSH includes agency workflows for organizing clients, campaigns, saved monthly plans and repeat orders. Final service availability and checkout pricing remain authoritative for every order.",
  },
  {
    question: "Do I need to share a password for any service?",
    answer:
      "No. SocialRUSH services are designed around public profile, post, video, channel, page or group links. Passwords are not required.",
  },
];

type ServicesPageProps = {
  searchParams?: {
    platform?: string;
    service?: string;
    type?: string;
    q?: string;
    search?: string;
  };
};

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const liveOnlyCodes = ["instagram-followers", "instagram-saves", "instagram-shares", "youtube-comments", "youtube-watch-hours", "facebook-group-members", "linkedin-followers", "linkedin-usa-connections", "linkedin-usa-post-likes", "linkedin-usa-endorsements", "linkedin-usa-followers", "linkedin-usa-group-members", "linkedin-usa-custom-comments", "linkedin-usa-reposts", "x-followers", "twitter-likes", "twitter-views", "twitter-retweets", "twitter-crypto-followers", "twitter-crypto-likes", "twitter-crypto-retweets", "twitter-crypto-custom-comments", "telegram-post-views", "telegram-post-reactions", "telegram-poll-votes", "tiktok-followers", "tiktok-likes", "tiktok-views", "tiktok-custom-comments", "tiktok-story-views", "tiktok-saves"] as const;
  const databaseNames: Partial<Record<(typeof liveOnlyCodes)[number], string>> = { "instagram-followers": "Instagram Real Followers", "linkedin-followers": "LinkedIn Profile Followers" };
  const resolvedLiveServices = await Promise.all(liveOnlyCodes.map(async (code) => {
    const fallback = getServiceById(code);
    if (!fallback) return null;
    const live = await getLiveServiceFacts(fallback.platform, databaseNames[code] ?? fallback.name, code);
    if (!live?.available || !Number.isFinite(live.rate) || live.rate <= 0 || live.min <= 0 || live.max < live.min) return null;
    return {
      ...fallback,
      pricePer1000: live.rate,
      minQuantity: live.min,
      maxQuantity: live.max,
      deliveryTime: live.deliveryTime,
      refillPolicy: live.refillPolicy,
      qualityType: live.qualityType,
      importantInstruction: live.importantInstruction,
    } satisfies SmmService;
  }));
  const liveServices = resolvedLiveServices.filter((service): service is SmmService => service !== null);
  const serviceCatalog = activeSmmServices.map((service) => liveServices.find((live) => live.code === service.code) ?? service).filter((service) => !service.requiresLiveCatalogFacts || liveServices.some((live) => live.code === service.code));
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Services", path: "/services" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: servicesFaqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
      <ServicesPageContent
        initialPlatformParam={searchParams?.platform}
        initialTypeParam={searchParams?.type ?? searchParams?.service}
        initialSearchParam={searchParams?.q ?? searchParams?.search}
        serviceCatalog={serviceCatalog}
      />
      <SmmPanelIndiaAuthority serviceCatalog={serviceCatalog} />
      <SocialMediaServicesIndiaAuthority />
      <ServiceCompareStudio serviceCatalog={serviceCatalog} />
      <ConversionDecisionBar />
      <IndiaGrowthDiscovery />
      <CrawlPriorityLinks />
    </>
  );
}
