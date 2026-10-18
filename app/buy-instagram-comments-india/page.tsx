import type { Metadata } from "next";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";
import PublicShell from "@/components/marketing/PublicShell";
import InstagramCommentsLanding from "@/components/marketing/InstagramCommentsLanding";
import { getLiveServiceFacts } from "@/lib/seo/live-service";
import { SEO_SITE_URL } from "@/lib/seo/metadata";
import MoneyPageAuthorityLinks from "@/components/seo/MoneyPageAuthorityLinks";
import ServiceSearchDecisionGuide from "@/components/seo/ServiceSearchDecisionGuide";
import { isOrderableInstagramCommentsService } from "@/lib/cro/instagram-comments-order";

export const metadata: Metadata = getIndiaServiceMetadata(
  "buy-instagram-comments-india",
  "/buy-instagram-comments-india",
);

export default async function BuyInstagramCommentsIndiaPage() {
  const live = await getLiveServiceFacts("instagram", "Instagram Comments");
  const url = `${SEO_SITE_URL}/buy-instagram-comments-india`;
  const schemas = [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SEO_SITE_URL }, { "@type": "ListItem", position: 2, name: "Instagram Growth", item: `${SEO_SITE_URL}/instagram-growth-india` }, { "@type": "ListItem", position: 3, name: "Instagram Comments", item: url }] },
    { "@context": "https://schema.org", "@type": "Service", name: "Instagram Comments India", serviceType: "Instagram comments service", url, areaServed: "IN", provider: { "@type": "Organization", name: "SocialRUSH", url: SEO_SITE_URL }, ...(isOrderableInstagramCommentsService(live) ? { offers: { "@type": "Offer", priceCurrency: "INR", price: live.rate, priceSpecification: { "@type": "UnitPriceSpecification", priceCurrency: "INR", price: live.rate, referenceQuantity: { "@type": "QuantitativeValue", value: 1000, unitText: "comments" } }, availability: "https://schema.org/InStock" } } : {}) },
  ];
  return <PublicShell serviceExperience tone="light3d"><div className="service-money-page instagram-cwv-page">{schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />)}<InstagramCommentsLanding live={live} /><ServiceSearchDecisionGuide service="instagram-comments" /><MoneyPageAuthorityLinks platform="instagram" /></div></PublicShell>;
}
