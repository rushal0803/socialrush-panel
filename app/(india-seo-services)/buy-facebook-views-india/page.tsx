import FacebookViewsLanding from "@/components/marketing/FacebookViewsLanding";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";
import IndiaCommercialServiceJsonLd from "@/components/seo/IndiaCommercialServiceJsonLd";
import MoneyPageAuthorityLinks from "@/components/seo/MoneyPageAuthorityLinks";

export const metadata = getIndiaServiceMetadata("buy-facebook-views-india");

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do I need my Facebook password?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. SocialRUSH only needs the public Facebook video or post URL requested by the service. Never share a password, login, or OTP.",
      },
    },
    {
      "@type": "Question",
      name: "Which Facebook link should I submit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Submit the exact public Facebook video or post link and verify that it opens publicly before continuing.",
      },
    },
    {
      "@type": "Question",
      name: "How is the price calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The active catalog rate is applied to the selected quantity and the live total is shown before checkout.",
      },
    },
    {
      "@type": "Question",
      name: "Can I track my order?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Continue through checkout and review status and order history from the SocialRUSH dashboard.",
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <IndiaCommercialServiceJsonLd
        code="facebook-views"
        name="Facebook Views"
        path="/facebook-views"
        platform="Facebook"
        serviceType="Facebook video views service"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FacebookViewsLanding />
      <MoneyPageAuthorityLinks platform="facebook" />
    </>
  );
}
