import AudienceLandingPage from "@/components/marketing/audiences/AudienceLandingPage";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { audiencePages } from "@/lib/marketing/audience-pages";
import { createPageMetadata } from "@/lib/seo/metadata";
const config = audiencePages.brands;
export const metadata = createPageMetadata({ title: "Social Media Campaign Services for Brands | SocialRUSH", description: "Explore SocialRUSH platform services for brand campaigns, product launches, recurring social requirements and multi-platform planning.", path: "/for-brands", keywords: ["social media campaign services for brands", "brand social media services India", "multi-platform campaign services"] });
export default function ForBrandsPage() { return <><BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "For Brands", path: "/for-brands" }]} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: config.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) }).replace(/</g, "\\u003c") }} /><AudienceLandingPage config={config} /></>; }
