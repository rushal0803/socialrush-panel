import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { SEO_SITE_URL } from "@/lib/seo/metadata";
import { getServiceById } from "@/lib/smm-service-catalog";

type Props = {
  code: string;
  name: string;
  path: string;
  platform: string;
  serviceType: string;
};

export default function IndiaCommercialServiceJsonLd({
  code,
  name,
  path,
  platform,
  serviceType,
}: Props) {
  const service = getServiceById(code);
  const pageUrl = new URL(path, `${SEO_SITE_URL}/`).toString();
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${name} India`,
    serviceType,
    url: pageUrl,
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    provider: {
      "@type": "Organization",
      name: "SocialRUSH",
      url: SEO_SITE_URL,
    },
    ...(service && service.pricePer1000 > 0
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: service.pricePer1000,
            availability: "https://schema.org/InStock",
            url: pageUrl,
          },
        }
      : {}),
  };

  // /twitter-followers already renders a purpose-built breadcrumb schema in its
  // route so its visible Twitter/X breadcrumb and JSON-LD stay aligned. Avoid
  // emitting a second BreadcrumbList from this shared commercial schema helper.
  const shouldRenderBreadcrumb = path !== "/twitter-followers";

  return (
    <>
      {shouldRenderBreadcrumb ? (
        <BreadcrumbJsonLd
          items={[
            { name: "Home", path: "/" },
            { name: `${platform} Growth India`, path: `/${platform.toLowerCase()}-growth-india` },
            { name, path },
          ]}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
