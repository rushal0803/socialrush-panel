import YouTubeSubscribersLanding from "@/components/marketing/YouTubeSubscribersLanding";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";
import { getServiceById } from "@/lib/smm-service-catalog";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const metadata = getIndiaServiceMetadata("buy-youtube-subscribers-india");

export default function Page() {
  const service = getServiceById("youtube-subscribers");
  const faqs = [
    ["How can I buy YouTube subscribers in India?", "Choose a subscriber package, provide the required public YouTube channel link, review the live INR total, and continue through the SocialRUSH order flow."],
    ["How much do YouTube subscribers cost in India?", "Pricing varies by selected quantity and the active service option. The package selector displays the current catalog rate and your exact total before checkout."],
    ["Do I need to provide my YouTube password?", "No. Only your public YouTube channel link is required. SocialRUSH never needs your Google login or channel credentials."],
    ["Which YouTube channel link should I submit?", "Use a public youtube.com/@handle, /channel/, /c/, or /user/ channel URL supported by the order form."],
    ["How long does delivery take?", `The active service estimate is ${service?.deliveryTime ?? "shown before checkout"}. Timing can vary by order size and channel availability.`],
    ["Is refill/support available?", `The current catalog lists ${service?.refillPolicy ?? "the service terms"}. Check the order summary for the applicable detail.`],
    ["Can I track my order?", "Yes. Continue through the secure SocialRUSH flow and track your order from the dashboard."],
    ["Can this guarantee YouTube monetization?", "No. Subscriber services do not guarantee monetization approval, watch hours, revenue, ranking, or YouTube Partner Program eligibility."],
    ["What if I submit the wrong channel link?", "Verify the public channel link carefully before payment. Contact support from your dashboard if you need help with an order."],
  ];
  const schema = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) }).replace(/</g, "\\u003c");
  return <><BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "YouTube Services", path: "/services?platform=youtube" }, { name: "YouTube Subscribers", path: "/youtube-subscribers" }]} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} /><YouTubeSubscribersLanding /></>;
}
