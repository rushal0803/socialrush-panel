import PackagesPageContent from "@/components/marketing/packages/PackagesPageContent";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Social Media Growth Packages India",
  description:
    "Compare SocialRUSH social media growth packages in India for Instagram followers, YouTube subscribers, Facebook followers, LinkedIn, TikTok and Twitter/X.",
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
      "SocialRUSH packages group platform, service type, quantity, delivery estimate and price so customers can compare growth options before checkout.",
  },
  {
    question: "Can I find Instagram, YouTube and Facebook packages on this page?",
    answer:
      "Yes. The Packages page includes available packages for Instagram, YouTube, Facebook and other supported platforms, with current pricing displayed before checkout.",
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
      <PackagesPageContent
        initialPlatformParam={searchParams?.platform}
        initialServiceParam={searchParams?.service}
        initialPackageIdParam={searchParams?.package ?? searchParams?.packageId}
      />
    </>
  );
}
