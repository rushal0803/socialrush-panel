import YouTubeLikesLanding from "@/components/marketing/YouTubeLikesLanding";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";
import { getServiceById } from "@/lib/smm-service-catalog";

export const metadata = getIndiaServiceMetadata("buy-youtube-likes-india");

export default function Page() {
  const service = getServiceById("youtube-likes");
  const faqs = [
    ["Do I need my YouTube password?", "No. SocialRUSH requires only a public YouTube video link and never needs Google login credentials."],
    ["Which video link should I submit?", "Use the exact public YouTube video or Short URL."],
    ["How is the price calculated?", "The active catalog rate is applied to the selected quantity and shown before checkout."],
    ["How long does delivery take?", `The active service estimate is ${service?.deliveryTime ?? "shown before checkout"}.`],
    ["Is refill/support available?", service?.refillPolicy ?? "Review the active service terms before ordering."],
    ["Can I track my order?", "Yes. Order tracking is available from the SocialRUSH dashboard."],
    ["Can likes guarantee YouTube ranking or monetization?", "No. Likes do not guarantee ranking, reach, virality, monetization, revenue, or any platform outcome."],
  ];
  const schema = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) }).replace(/</g, "\\u003c");
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} /><YouTubeLikesLanding /></>;
}
