import type { Metadata } from "next";
import { activeSmmServices, platformMeta } from "@/lib/smm-service-catalog";
import { SEO_SITE_URL } from "@/lib/seo/metadata";

export function createCatalogServiceMetadata(serviceCode: string): Metadata {
  const service = activeSmmServices.find((item) => item.code === serviceCode);
  if (!service) return {};
  const platform = platformMeta[service.platform].label;
  const title = `Buy ${service.name} | SocialRUSH`;
  const description = `Order ${service.name} with transparent pricing, public-link ordering, service requirements and dashboard tracking. Review current ${platform} campaign details before checkout.`;
  const path = `/services/${service.code}`;

  return {
    metadataBase: new URL(SEO_SITE_URL),
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: "SocialRUSH",
      title,
      description,
      url: path,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
