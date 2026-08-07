import type { Metadata } from "next";
import HomepageContent from "@/components/marketing/HomepageContent";
import { createPageMetadata } from "@/lib/seo/metadata";
import { homepageFaqItems } from "@/lib/seo/homepage-faq";

const homepageMetadata = createPageMetadata({
  title: "Social Media Growth Services | SocialRUSH",
  description:
    "Explore transparent social media growth services, secure ordering, refill information and clear order tracking through the SocialRUSH dashboard.",
  path: "/",
});

export const metadata: Metadata = {
  ...homepageMetadata,
  title: {
    absolute: "Social Media Growth Services | SocialRUSH",
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
