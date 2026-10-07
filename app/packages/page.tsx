import PremiumPackagesPageContent from "@/components/marketing/packages/PremiumPackagesPageContent";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getLivePackageGroups } from "@/lib/package-catalog.server";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Social Media Packages India | Compare Prices & Quantities",
  description:
    "Compare SocialRUSH social media packages in India by platform, service, quantity and price. Review delivery, refill details and the final package total before checkout.",
  path: "/packages",
  keywords: [
    "social media growth packages India",
    "Instagram follower packages India",
    "YouTube subscriber packages India",
    "Facebook follower packages India",
  ],
});

const packagesFaqs = [
  { question: "What is included?", answer: "Each package includes the displayed quantity for one service and one destination link." },
  { question: "How do savings work?", answer: "Larger tiers receive the displayed discount. Review your total before placing an order." },
  { question: "Where can I track my order?", answer: "Sign in to view progress in your dashboard. Check service details for link requirements and refill terms." },
];

type PackagesPageProps = {
  searchParams?: {
    platform?: string;
    service?: string;
    package?: string;
    packageId?: string;
  };
};

export default async function PackagesPage({ searchParams }: PackagesPageProps) {
  const groups = await getLivePackageGroups();
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
        initialGroups={groups}
        initialPlatformParam={searchParams?.platform}
        initialServiceParam={searchParams?.service}
        initialPackageIdParam={searchParams?.package ?? searchParams?.packageId}
      />
      <nav aria-label="Explore service packages" className="bg-[#070707] px-4 pb-8 text-white">
        <details className="mx-auto max-w-7xl rounded-xl border border-white/15 p-4">
          <summary className="cursor-pointer text-sm font-semibold">Explore package services</summary>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {groups.map((group) => <li key={group.service.code}><a href={`/packages?platform=${group.platform}&service=${group.service.code}`} className="text-sm text-orange-200 underline">{group.service.name} packages</a></li>)}
          </ul>
        </details>
      </nav>
    </>
  );
}
