import ServicesPageContent from "@/components/marketing/services/ServicesPageContent";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getLiveServiceFacts } from "@/lib/seo/live-service";
import { activeSmmServices, getServiceById, type SmmService } from "@/lib/smm-service-catalog";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
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
  const liveOnlyCodes = ["instagram-followers", "instagram-saves", "instagram-shares", "youtube-comments", "youtube-watch-hours", "facebook-group-members", "linkedin-followers", "x-followers"] as const;
  const databaseNames: Partial<Record<(typeof liveOnlyCodes)[number], string>> = { "instagram-followers": "Instagram Real Followers", "linkedin-followers": "LinkedIn Profile Followers" };
  const resolvedLiveServices = await Promise.all(liveOnlyCodes.map(async (code) => {
    const fallback = getServiceById(code);
    if (!fallback) return null;
    const live = await getLiveServiceFacts(fallback.platform, databaseNames[code] ?? fallback.name);
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
    </>
  );
}
