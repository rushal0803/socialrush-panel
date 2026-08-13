import FacebookFollowersLanding from "@/components/marketing/FacebookFollowersLanding";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";
import { SEO_SITE_URL } from "@/lib/seo/metadata";

export const metadata = getIndiaServiceMetadata("buy-facebook-followers-india");

const faqs = [
  ["How can I buy Facebook followers in India?", "Select a quantity in the order builder, provide the required public Facebook Page or profile URL, review the live INR total, and continue through the secure SocialRUSH order flow."],
  ["How much do Facebook followers cost in India?", "Pricing depends on the quantity you select. The order builder shows the active INR rate and your exact live total before you continue to checkout. You can also review current service pricing on the pricing page."],
  ["Do I need my Facebook password?", "No. SocialRUSH only requires the public Facebook page or profile URL requested by the service. Never share a password or login credential."],
  ["Which Facebook link should I submit?", "Submit the public Facebook Page or profile link you want to use. Verify it opens publicly before continuing."],
  ["Can I order followers for a Facebook Page?", "Yes, provided the page is public and its URL meets the service requirements shown in the order builder."],
  ["Does buying followers guarantee engagement or organic reach?", "No. A follower order does not guarantee engagement, organic reach, sales, or account growth. Keep expectations realistic and continue your normal content work."],
] as const;

function jsonLd(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function Page() {
  const url = `${SEO_SITE_URL}/buy-facebook-followers-india`;
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) };
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SEO_SITE_URL }, { "@type": "ListItem", position: 2, name: "Facebook Services", item: `${SEO_SITE_URL}/services` }, { "@type": "ListItem", position: 3, name: "Facebook Followers", item: url }] };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} /><FacebookFollowersLanding /></>;
}
