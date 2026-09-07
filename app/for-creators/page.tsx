import AudienceLandingPage from "@/components/marketing/audiences/AudienceLandingPage";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { audiencePages } from "@/lib/marketing/audience-pages";
import { createPageMetadata } from "@/lib/seo/metadata";
const config = audiencePages.creators;
export const metadata = createPageMetadata({ title: "Social Media Services for Creators | SocialRUSH", description: "Explore Instagram, YouTube, TikTok and X / Twitter service paths with public-link ordering, service details and dashboard tracking.", path: "/for-creators", keywords: ["social media services for creators", "creator growth services India", "Instagram YouTube TikTok services"] });
export default function ForCreatorsPage() { return <><BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "For Creators", path: "/for-creators" }]} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: config.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) }).replace(/</g, "\\u003c") }} /><AudienceLandingPage config={config} /></>; }
