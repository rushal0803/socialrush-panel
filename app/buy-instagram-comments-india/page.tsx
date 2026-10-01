import type { Metadata } from "next";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";
import PublicShell from "@/components/marketing/PublicShell";
import InteractiveHomepageShell from "@/components/marketing/InteractiveHomepageShell";
import InstagramCommentsLanding from "@/components/marketing/InstagramCommentsLanding";
import { getLiveServiceFacts } from "@/lib/seo/live-service";
import { SEO_SITE_URL } from "@/lib/seo/metadata";
import MoneyPageAuthorityLinks from "@/components/seo/MoneyPageAuthorityLinks";
import InstagramInformationGainSection from "@/components/seo/InstagramInformationGainSection";

export const metadata: Metadata = getIndiaServiceMetadata(
  "buy-instagram-comments-india",
  "/buy-instagram-comments-india",
);

export default async function BuyInstagramCommentsIndiaPage() {
  const live = await getLiveServiceFacts("instagram", "Instagram Comments");
  const url = `${SEO_SITE_URL}/buy-instagram-comments-india`;
  const schemas = [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SEO_SITE_URL }, { "@type": "ListItem", position: 2, name: "Instagram Growth", item: `${SEO_SITE_URL}/instagram-growth-india` }, { "@type": "ListItem", position: 3, name: "Instagram Comments", item: url }] },
    { "@context": "https://schema.org", "@type": "Service", name: "Instagram Comments India", serviceType: "Instagram comments service", url, areaServed: "IN", provider: { "@type": "Organization", name: "SocialRUSH", url: SEO_SITE_URL }, ...(live?.available && Number.isFinite(live.rate) ? { offers: { "@type": "Offer", priceCurrency: "INR", price: live.rate, availability: "https://schema.org/InStock" } } : {}) },
  ];
  return <PublicShell tone="light3d"><InteractiveHomepageShell><div className="service-money-page">{schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />)}<InstagramCommentsLanding live={live} /><InstagramInformationGainSection serviceCode="instagram-comments" ratePer1000={live?.rate ?? null} minQuantity={live?.min ?? null} maxQuantity={live?.max ?? null} deliveryTime={live?.deliveryTime ?? null} refillPolicy={live?.refillPolicy ?? null} orderHref="/packages?platform=instagram&service=comments" /><MoneyPageAuthorityLinks platform="instagram" /></div></InteractiveHomepageShell></PublicShell>;
}
