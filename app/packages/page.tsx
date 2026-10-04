import PremiumPackagesPageContent from "@/components/marketing/packages/PremiumPackagesPageContent";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Social Media Growth Packages India | Prices & Delivery",
  description:
    "Compare available SocialRUSH social media packages in India with clear pricing, quantities, delivery estimates and refill information before you order.",
  path: "/packages",
  keywords: [
    "social media growth packages India",
    "Instagram follower packages India",
    "YouTube subscriber packages India",
    "Facebook follower packages India",
  ],
});

const packagesFaqs = [
  {
    question: "What are SocialRUSH social media growth packages?",
    answer:
      "SocialRUSH packages group platform, service type, quantity and price so customers can compare growth options before checkout.",
  },
  {
    question: "Can I find Instagram, YouTube and Facebook packages on this page?",
    answer:
      "Yes. The Packages page includes package options for active supported platforms and services where fixed package pricing is available.",
  },
  {
    question: "Is the final package price shown before I place an order?",
    answer:
      "Yes. SocialRUSH shows the selected package price and order details before checkout so you can review the total before confirming.",
  },
];

type PackagesPageProps = {
  searchParams?: {
    platform?: string;
    service?: string;
    package?: string;
    packageId?: string;
  };
};

export default function PackagesPage({ searchParams }: PackagesPageProps) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Packages", path: "/packages" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: packagesFaqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
      <PremiumPackagesPageContent
        initialPlatformParam={searchParams?.platform}
        initialServiceParam={searchParams?.service}
        initialPackageIdParam={searchParams?.package ?? searchParams?.packageId}
      />
    </>
  );
}
