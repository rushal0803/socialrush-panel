import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import ServiceSearchDecisionGuide from "@/components/seo/ServiceSearchDecisionGuide";
import BlogShell from "@/components/marketing/PublicShell";
import YouTubeWatchHoursWorkspace from "@/components/marketing/YouTubeWatchHoursWorkspace";
import YouTubeWatchHoursBuyerGuide from "@/components/seo/YouTubeWatchHoursBuyerGuide";
import { getLiveServiceFacts } from "@/lib/seo/live-service";
import { createPageMetadata } from "@/lib/seo/metadata";
import { youtubeWatchHoursFaqs } from "@/lib/seo/youtube-watch-hours-faq";

const path = "/buy-youtube-watch-hours-india";


export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Buy YouTube Watch Hours India | INR Pricing | SocialRUSH",
    description: "Compare YouTube watch hours in India: live INR rates and public-video requirements. Purchased watch time may not count. Monetization is not guaranteed.",
    path,
    keywords: ["buy YouTube watch hours India", "YouTube watch hours service India"],
  }),
  robots: { index: true, follow: true },
};

export default async function YouTubeWatchHoursPage() {
  const live = await getLiveServiceFacts("youtube", "YouTube Watch Hours");
  const schema = JSON.stringify({ "@context": "https://schema.org", "@graph": [
    { "@type": "Service", name: "YouTube Watch Hours", serviceType: "YouTube watch-hours service", url: `https://www.getsocialrush.com${path}`, areaServed: "IN", provider: { "@type": "Organization", name: "SocialRUSH", url: "https://www.getsocialrush.com" }, description: "Public YouTube video watch-time campaign service with live pricing and dashboard tracking." },
    { "@type": "FAQPage", mainEntity: youtubeWatchHoursFaqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) },
  ] }).replace(/</g, "\\u003c");
  return <BlogShell serviceExperience><BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "YouTube Growth", path: "/youtube-growth-india" }, { name: "YouTube Watch Hours", path }]} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} /><YouTubeWatchHoursWorkspace facts={live} buyerGuide={<YouTubeWatchHoursBuyerGuide />} /><ServiceSearchDecisionGuide service="youtube-watch-hours" /></BlogShell>;
}
