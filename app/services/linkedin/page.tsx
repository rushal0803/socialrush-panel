import PlatformServicesLanding from "@/components/marketing/services/PlatformServicesLanding";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { activeSmmServices } from "@/lib/smm-service-catalog";
import { createPageMetadata, SEO_SITE_URL } from "@/lib/seo/metadata";

const path = "/services/linkedin";
const services = activeSmmServices.filter((service) => service.platform === "linkedin");
const canonicalCorePaths: Record<string, string> = {
  "linkedin-followers": "/linkedin-followers",
  "linkedin-likes": "/linkedin-likes",
};

export const metadata = createPageMetadata({
  title: "LinkedIn Growth Services | Followers, Likes & USA Options | SocialRUSH",
  description: "Explore all SocialRUSH LinkedIn growth services in one place, including followers, likes, connections, reposts, endorsements, group members and USA-focused options.",
  path,
  keywords: ["LinkedIn growth services", "LinkedIn followers India", "LinkedIn likes", "LinkedIn USA followers", "LinkedIn connections service"],
});

export default function LinkedInServicesPage() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "SocialRUSH LinkedIn Services",
    numberOfItems: services.length,
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: service.name,
      url: `${SEO_SITE_URL}${canonicalCorePaths[service.code] ?? `/services/${service.code}`}`,
    })),
  };

  return <>
    <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: "LinkedIn Services", path }]} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList).replace(/</g, "\\u003c") }} />
    <PlatformServicesLanding platform="linkedin" />
  </>;
}
