import type { Metadata } from "next";
import HomepageContent from "@/components/marketing/HomepageContent";
import { createPageMetadata } from "@/lib/seo/metadata";
import { homepageFaqItems } from "@/lib/seo/homepage-faq";

const homepageMetadata = createPageMetadata({
  title: "SocialRUSH | Social Media Growth Services India",
  description:
    "SocialRUSH helps creators, brands and businesses order social media growth services in India with public-link ordering, transparent pricing, dashboard tracking and WhatsApp support.",
  path: "/",
});

export const metadata: Metadata = {
  ...homepageMetadata,
  title: {
    absolute: "SocialRUSH | Social Media Growth Services India",
  },
};

export default function HomePage({
  searchParams,
}: {
  searchParams?: { platform?: string; service?: string };
}) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homepageFaqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomepageContent searchParams={searchParams} />
    </>
  );
}
