import HomepageContent from "@/components/marketing/HomepageContent";
import { createPageMetadata } from "@/lib/seo/metadata";
import { homepageFaqItems } from "@/lib/seo/homepage-faq";

export const metadata = createPageMetadata({
  title: "Social Media Growth Services India",
  description:
    "SocialRUSH offers social media growth services in India for Instagram, YouTube, LinkedIn, Facebook, TikTok and X with transparent pricing and order tracking.",
  path: "/",
});

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
