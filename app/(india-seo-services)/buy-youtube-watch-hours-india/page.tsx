import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import BlogShell from "@/components/marketing/blog/BlogShell";
import YouTubeWatchHoursWorkspace from "@/components/marketing/YouTubeWatchHoursWorkspace";
import { getLiveServiceFacts } from "@/lib/seo/live-service";
import { createPageMetadata } from "@/lib/seo/metadata";

const path = "/buy-youtube-watch-hours-india";
const faqs = [
  ["What are YouTube watch hours?", "Watch hours describe time watched on a video. This service uses public-video viewing activity; YouTube independently calculates reporting and eligibility."],
  ["Which YouTube link should I submit?", "Submit the exact public YouTube video URL, not a channel URL."],
  ["Can this guarantee YouTube monetization?", "No. YouTube decides eligible public watch hours, channel eligibility, policy compliance and Partner Program approval."],
] as const;

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Buy YouTube Watch Hours in India | SocialRUSH",
    description: "Buy YouTube watch hours in India with public-video ordering, live pricing, watch-time estimates and secure SocialRUSH dashboard tracking.",
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
  return <BlogShell><BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Services", path: "/services?platform=youtube" }, { name: "YouTube Watch Hours", path }]} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} /><YouTubeWatchHoursWorkspace facts={live} /></BlogShell>;
}
