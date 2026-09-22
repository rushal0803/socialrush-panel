import PlatformServicesLanding from "@/components/marketing/services/PlatformServicesLanding";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { activeSmmServices } from "@/lib/smm-service-catalog";
import { createPageMetadata, SEO_SITE_URL } from "@/lib/seo/metadata";

const path = "/services/telegram";
const services = activeSmmServices.filter((service) => service.platform === "telegram");

export const metadata = createPageMetadata({
  title: "Telegram Growth Services | Members, Views, Reactions & Poll Votes | SocialRUSH",
  description: "Explore SocialRUSH Telegram growth services, including members, post views, reactions and poll votes with clear public-link requirements and dashboard tracking.",
  path,
  keywords: ["Telegram growth services", "Telegram members India", "Telegram post views", "Telegram reactions", "Telegram poll votes"],
});

export default function TelegramServicesPage() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "SocialRUSH Telegram Services",
    numberOfItems: services.length,
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: service.name,
      url: service.code === "telegram-members"
        ? `${SEO_SITE_URL}/telegram-members`
        : `${SEO_SITE_URL}/services/${service.code}`,
    })),
  };

  return <>
    <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: "Telegram Services", path }]} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList).replace(/</g, "\\u003c") }} />
    <PlatformServicesLanding platform="telegram" />
  </>;
}
