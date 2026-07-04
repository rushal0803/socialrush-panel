import type { Metadata } from "next";
import HomepageContent from "@/components/marketing/HomepageContent";
import { createPageMetadata } from "@/lib/seo/metadata";
import { homepageFaqItems } from "@/lib/seo/homepage-faq";

const homepageMetadata = createPageMetadata({
  title: "SocialRUSH | Social Media Growth Services for Creators & Brands",
  description:
    "SocialRUSH helps creators, brands and businesses manage social media growth campaigns with public-link ordering, secure checkout, transparent pricing, dashboard tracking and WhatsApp support.",
  path: "/",
});

export const metadata: Metadata = {
  ...homepageMetadata,
  title: {
    absolute: "SocialRUSH | Social Media Growth Services for Creators & Brands",
  },
};

export default function HomePage() {
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
      <HomepageContent />
    </>
  );
}
