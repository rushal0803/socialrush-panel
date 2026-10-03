import PlatformServicesLanding from "@/components/marketing/services/PlatformServicesLanding";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { activeSmmServices } from "@/lib/smm-service-catalog";
import { createPageMetadata, SEO_SITE_URL } from "@/lib/seo/metadata";

const path = "/services/twitter-x";
const services = activeSmmServices.filter((service) => service.platform === "x");

export const metadata = createPageMetadata({
  title: "Twitter / X Services Catalog | Likes, Views, Reposts & Crypto | SocialRUSH",
  description: "Browse the SocialRUSH Twitter / X service catalog, including followers, likes, views, reposts and crypto-focused options with clear ordering requirements.",
  path,
  keywords: ["Twitter services catalog", "X services catalog", "Twitter engagement services", "X crypto services"],
});

export default function TwitterXServicesPage() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "SocialRUSH Twitter X Services",
    numberOfItems: services.length,
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: service.name,
      url: `${SEO_SITE_URL}/services/${service.code}`,
    })),
  };

  return <>
    <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: "Twitter / X Services", path }]} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList).replace(/</g, "\\u003c") }} />
    <PlatformServicesLanding platform="x" />
  </>;
}
