import YouTubeSubscribersLanding from "@/components/marketing/YouTubeSubscribersLanding";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";
import { getServiceById } from "@/lib/smm-service-catalog";

export const metadata = getIndiaServiceMetadata("buy-youtube-subscribers-india");

export default function Page() {
  const service = getServiceById("youtube-subscribers");
  const faqs = [
    ["Do I need to provide my YouTube password?", "No. SocialRUSH requires only a public YouTube channel link and never needs Google login credentials."],
    ["Which YouTube channel link should I submit?", "Use a supported public channel, handle, custom, or user channel URL."],
    ["How is the price calculated?", "The current catalog rate is applied to the selected quantity and shown before checkout."],
    ["How long does delivery take?", `The active service estimate is ${service?.deliveryTime ?? "shown before checkout"}.`],
    ["Is refill/support available?", service?.refillPolicy ?? "Review the active service terms before ordering."],
    ["Can I track my order?", "Yes. Order tracking is available from the SocialRUSH dashboard."],
    ["Can this guarantee YouTube monetization?", "No. Subscriber services do not guarantee monetization approval, watch hours, or YouTube Partner Program eligibility."],
  ];
  const schema = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) }).replace(/</g, "\\u003c");
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} /><YouTubeSubscribersLanding /></>;
}
