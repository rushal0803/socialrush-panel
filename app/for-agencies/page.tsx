import AudienceLandingPage from "@/components/marketing/audiences/AudienceLandingPage";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { audiencePages } from "@/lib/marketing/audience-pages";
import { createPageMetadata, SEO_SITE_URL } from "@/lib/seo/metadata";

const config = audiencePages.agencies;

export const metadata = createPageMetadata({
  title: "Social Media Services for Agencies India | SocialRUSH",
  description: "Explore SocialRUSH social media services for agencies and resellers in India with an agency workspace, bulk job planning, campaign stacks and support for larger repeat client requirements.",
  path: "/for-agencies",
  keywords: [
    "social media services for agencies India",
    "social media reseller services India",
    "agency social media campaign services",
    "bulk social media service enquiry",
    "social media packages for agencies",
    "social media reseller panel India",
  ],
});

function jsonLd(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function ForAgenciesPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
  const discoverySchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "SocialRUSH agency and reseller workflow",
    itemListElement: [
      ["Agency / Reseller Hub", "/dashboard/reseller"],
      ["Bulk Job Planner", "/dashboard/reseller/bulk-planner"],
      ["Campaign Stacks", "/dashboard/campaign-stacks"],
      ["Bulk and agency support", "/contact#support-form"],
    ].map(([name, path], index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      url: `${SEO_SITE_URL}${path}`,
    })),
  };

  return <>
    <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "For Agencies", path: "/for-agencies" }]} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(discoverySchema) }} />
    <AudienceLandingPage config={config} />
  </>;
}
