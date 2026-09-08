import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { SEO_SITE_URL } from "@/lib/seo/metadata";
import { getServiceById } from "@/lib/smm-service-catalog";

type YouTubeEngagementServiceCode = "youtube-likes" | "youtube-views";

type YouTubeEngagementJsonLdProps = {
  code: YouTubeEngagementServiceCode;
  name: "YouTube Likes" | "YouTube Views";
  path: "/youtube-likes" | "/youtube-views";
};

export default function YouTubeEngagementJsonLd({
  code,
  name,
  path,
}: YouTubeEngagementJsonLdProps) {
  const service = getServiceById(code);
  const pageUrl = new URL(path, `${SEO_SITE_URL}/`).toString();
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${name} India`,
    serviceType: `${name} service`,
    url: pageUrl,
    areaServed: "IN",
    provider: {
      "@type": "Organization",
      name: "SocialRUSH",
      url: SEO_SITE_URL,
    },
    ...(service
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

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "YouTube Services", path: "/youtube-growth-india" },
          { name, path },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
