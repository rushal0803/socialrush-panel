import type { Metadata } from "next";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";
import PublicShell from "@/components/marketing/PublicShell";
import InstagramCommentsLanding from "@/components/marketing/InstagramCommentsLanding";
import { getLiveServiceFacts } from "@/lib/seo/live-service";
import { SEO_SITE_URL } from "@/lib/seo/metadata";

export const metadata: Metadata = getIndiaServiceMetadata(
  "buy-instagram-comments-india",
  "/buy-instagram-comments-india",
);

export default async function BuyInstagramCommentsIndiaPage() {
  const live = await getLiveServiceFacts("instagram", "Instagram Comments");
  const url = `${SEO_SITE_URL}/buy-instagram-comments-india`;
  const schemas = [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SEO_SITE_URL }, { "@type": "ListItem", position: 2, name: "Services", item: `${SEO_SITE_URL}/services` }, { "@type": "ListItem", position: 3, name: "Instagram Comments", item: url }] },
    { "@context": "https://schema.org", "@type": "Service", name: "Instagram Comments India", serviceType: "Instagram comments service", url, areaServed: "IN", provider: { "@type": "Organization", name: "SocialRUSH", url: SEO_SITE_URL }, offers: { "@type": "Offer", priceCurrency: "INR", ...(live ? { price: live.rate } : {}), unitText: "1,000 comments", availability: live?.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" } },
  ];
  return <PublicShell tone="light3d">{schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />)}<InstagramCommentsLanding live={live} /></PublicShell>;
}
