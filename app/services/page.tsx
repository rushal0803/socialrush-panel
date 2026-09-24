import type { Metadata } from "next";
import ServicesPageContent from "@/components/marketing/services/ServicesPageContent";
import ServiceCompareStudio from "@/components/marketing/services/ServiceCompareStudio";
import IndiaGrowthDiscovery from "@/components/marketing/IndiaGrowthDiscovery";
import ConversionDecisionBar from "@/components/marketing/ConversionDecisionBar";
import CrawlPriorityLinks from "@/components/seo/CrawlPriorityLinks";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getLiveServiceFacts } from "@/lib/seo/live-service";
import { activeSmmServices, type SmmService } from "@/lib/smm-service-catalog";\nimport { liveServiceSyncDefinitions, shouldHideWithoutLiveFacts } from "@/lib/live-service-sync";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Social Media Growth Services | SocialRUSH",
  description:
    "Browse SocialRUSH services by platform, compare transparent pricing and delivery information, and choose an option that fits your campaign.",
  path: "/services",
  keywords: [
    "social media growth services India",
    "buy Instagram followers India",
    "buy YouTube subscribers India",
    "buy Facebook followers India",
    "Instagram growth services India",
    "YouTube growth services India",
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
  const resolvedLiveServices = await Promise.all(liveServiceSyncDefinitions.map(async (definition) => {
    const fallback = activeSmmServices.find((service) => service.code === definition.code);
    if (!fallback) return null;
    const live = await getLiveServiceFacts(definition.platform, definition.databaseName, definition.code);
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
  const serviceCatalog = activeSmmServices
    .map((service) => liveServices.find((live) => live.code === service.code) ?? service)
    .filter((service) => !shouldHideWithoutLiveFacts(service) || liveServices.some((live) => live.code === service.code));
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
      <ServiceCompareStudio serviceCatalog={serviceCatalog} />
      <ConversionDecisionBar />
      <IndiaGrowthDiscovery />
      <CrawlPriorityLinks />
    </>
  );
}
