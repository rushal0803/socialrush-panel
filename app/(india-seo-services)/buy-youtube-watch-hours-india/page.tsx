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
  ["What are YouTube watch hours?", "Watch hours measure time watched on a video. The page calculator illustrates full-length viewing, while YouTube independently determines actual and eligible watch hours."],
  ["Which YouTube link should I submit?", "Submit the exact public YouTube video URL, not a channel URL."],
  ["Can this guarantee YouTube monetization?", "No. YouTube decides eligible public watch hours, channel eligibility, policy compliance and Partner Program approval."],
  ["Does a 60-minute video viewed 1,000 times guarantee 1,000 watch hours?", "No. That is an illustration assuming every view watches all 60 minutes, not an expected or verified result. Actual and qualified watch hours can be lower or zero."],
  ["Do paid or artificial views count toward the 4,000 watch-hours requirement?", "YouTube excludes ad-campaign watch time and Shorts Feed watch time from the 4,000-hour long-form threshold. Artificial engagement may violate YouTube policies and be discounted."],
  ["What should I check before buying watch hours in India?", "Check the correct public video link, current service availability, the live INR total, quantity limits, delivery estimate and refill or support terms. INR pricing does not guarantee Indian viewers."],
] as const;

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Buy YouTube Watch Hours India | INR Pricing | SocialRUSH",
    description: "Buy YouTube watch hours in India for public videos. Check live INR pricing, estimate limitations and policy risks. Monetization is not guaranteed.",
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
