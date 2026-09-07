import AudienceLandingPage from "@/components/marketing/audiences/AudienceLandingPage";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { audiencePages } from "@/lib/marketing/audience-pages";
import { createPageMetadata } from "@/lib/seo/metadata";
const config = audiencePages.agencies;
export const metadata = createPageMetadata({ title: "Social Media Services for Agencies | SocialRUSH", description: "Explore SocialRUSH’s multi-platform catalog, packages, public pricing and support path for repeat agency campaign requirements.", path: "/for-agencies", keywords: ["social media services for agencies", "agency social media campaign services", "bulk social media service enquiry"] });
export default function ForAgenciesPage() { return <><BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "For Agencies", path: "/for-agencies" }]} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: config.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) }).replace(/</g, "\\u003c") }} /><AudienceLandingPage config={config} /></>; }
