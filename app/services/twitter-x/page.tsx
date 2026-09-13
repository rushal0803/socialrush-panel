import PlatformServicesLanding from "@/components/marketing/services/PlatformServicesLanding";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { activeSmmServices } from "@/lib/smm-service-catalog";
import { createPageMetadata, SEO_SITE_URL } from "@/lib/seo/metadata";

const path = "/services/twitter-x";
const services = activeSmmServices.filter((service) => service.platform === "x");

export const metadata = createPageMetadata({
  title: "Twitter / X Growth Services | Followers, Likes, Views & Reposts | SocialRUSH",
  description: "Explore all SocialRUSH Twitter / X growth services, including followers, likes, views, reposts and crypto-focused engagement options with clear ordering requirements.",
  path,
  keywords: ["Twitter growth services", "X growth services", "Twitter followers India", "Twitter likes", "Twitter views", "Twitter reposts"],
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
