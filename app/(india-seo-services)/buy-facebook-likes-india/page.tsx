import FacebookLikesLanding from "@/components/marketing/FacebookLikesLanding";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";
import IndiaCommercialServiceJsonLd from "@/components/seo/IndiaCommercialServiceJsonLd";
import MoneyPageAuthorityLinks from "@/components/seo/MoneyPageAuthorityLinks";

export const metadata = getIndiaServiceMetadata("buy-facebook-likes-india");

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do I need my Facebook password?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. SocialRUSH only needs the public Facebook post or video URL required by this service. Never share a password, login, or OTP.",
      },
    },
    {
      "@type": "Question",
      name: "Which Facebook post link should I submit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Submit the exact public Facebook post or video link and confirm that it opens publicly and points to the intended content.",
      },
    },
    {
      "@type": "Question",
      name: "How is the price calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The total is calculated from the active catalog rate and selected quantity and is shown before checkout.",
      },
    },
    {
      "@type": "Question",
      name: "Can I track my order?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. After checkout, use the SocialRUSH dashboard to review order status and history.",
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <IndiaCommercialServiceJsonLd
        code="facebook-likes"
        name="Facebook Likes"
        path="/facebook-likes"
        platform="Facebook"
        serviceType="Facebook likes service"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FacebookLikesLanding />
      <MoneyPageAuthorityLinks platform="facebook" />
    </>
  );
}
