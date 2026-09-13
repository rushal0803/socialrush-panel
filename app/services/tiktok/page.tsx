import PlatformServicesLanding from "@/components/marketing/services/PlatformServicesLanding";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { activeSmmServices } from "@/lib/smm-service-catalog";
import { createPageMetadata, SEO_SITE_URL } from "@/lib/seo/metadata";

const path = "/services/tiktok";
const services = activeSmmServices.filter((service) => service.platform === "tiktok");

export const metadata = createPageMetadata({
  title: "TikTok Growth Services | Followers, Likes, Views & Comments | SocialRUSH",
  description: "Explore all SocialRUSH TikTok growth services, including followers, likes, views, custom comments, story views and saves with clear ordering requirements.",
  path,
  keywords: ["TikTok growth services", "TikTok followers India", "TikTok likes", "TikTok views", "TikTok comments", "TikTok saves"],
});

export default function TikTokServicesPage() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "SocialRUSH TikTok Services",
    numberOfItems: services.length,
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: service.name,
      url: `${SEO_SITE_URL}/services/${service.code}`,
    })),
  };

  return <>
    <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: "TikTok Services", path }]} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList).replace(/</g, "\\u003c") }} />
    <PlatformServicesLanding platform="tiktok" />
  </>;
}
