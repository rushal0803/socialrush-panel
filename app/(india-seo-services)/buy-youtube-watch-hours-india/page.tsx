import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import ServiceSearchDecisionGuide from "@/components/seo/ServiceSearchDecisionGuide";
import BlogShell from "@/components/marketing/PublicShell";
import YouTubeWatchHoursWorkspace from "@/components/marketing/YouTubeWatchHoursWorkspace";
import YouTubeWatchHoursBuyerGuide from "@/components/seo/YouTubeWatchHoursBuyerGuide";
import { getLiveServiceFacts } from "@/lib/seo/live-service";
import { createPageMetadata } from "@/lib/seo/metadata";

const path = "/buy-youtube-watch-hours-india";
const faqs = [
  ["What are YouTube watch hours?", "Watch hours describe time watched on a video. This service uses public-video viewing activity; YouTube independently calculates reporting and eligibility."],
  ["Which YouTube link should I submit?", "Submit the exact public YouTube video URL, not a channel URL."],
  ["Can this guarantee YouTube monetization?", "No. YouTube decides eligible public watch hours, channel eligibility, policy compliance and Partner Program approval."],
  ["How are watch-hour estimates calculated?", "Illustrative hours equal view quantity times video minutes times an assumed average percentage viewed, divided by 60. They are not delivered or monetization-eligible hours."],
  ["Do Shorts or ad campaigns count toward the 4,000-hour threshold?", "No. YouTube excludes Shorts watch time and ad-campaign watch time from its long-form public watch-hours threshold."],
  ["Are estimated watch hours guaranteed by the order?", "No. Estimates are planning illustrations only. YouTube verifies engagement and independently determines qualified watch time."],
] as const;

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Buy YouTube Watch Hours India | INR Pricing | SocialRUSH",
    description: "Buy YouTube watch hours in India for public videos. Compare live INR pricing and realistic watch-time estimates. Monetization is not guaranteed.",
    path,
    keywords: ["buy YouTube watch hours India", "YouTube watch hours service India"],
  }),
  robots: { index: true, follow: true },
};

export default async function YouTubeWatchHoursPage() {
  const live = await getLiveServiceFacts("youtube", "YouTube Watch Hours");
  const schema = JSON.stringify({ "@context": "https://schema.org", "@graph": [
    { "@type": "Service", name: "YouTube Watch Hours", serviceType: "YouTube watch-hours service", url: `https://www.getsocialrush.com${path}`, areaServed: "IN", provider: { "@type": "Organization", name: "SocialRUSH", url: "https://www.getsocialrush.com" }, description: "Public YouTube video watch-time campaign service with live pricing and dashboard tracking." },
    { "@type": "FAQPage", mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) },
  ] }).replace(/</g, "\\u003c");
  return <BlogShell serviceExperience><BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "YouTube Growth", path: "/youtube-growth-india" }, { name: "YouTube Watch Hours", path }]} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} /><YouTubeWatchHoursWorkspace facts={live} buyerGuide={<YouTubeWatchHoursBuyerGuide />} /><ServiceSearchDecisionGuide service="youtube-watch-hours" /></BlogShell>;
}
