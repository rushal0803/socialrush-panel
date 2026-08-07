import ServicesPageContent from "@/components/marketing/services/ServicesPageContent";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";

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

export default function ServicesPage({ searchParams }: ServicesPageProps) {
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
      />
    </>
  );
}
