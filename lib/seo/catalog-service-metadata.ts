import type { Metadata } from "next";
import { activeSmmServices, platformMeta } from "@/lib/smm-service-catalog";
import { SEO_SITE_URL } from "@/lib/seo/metadata";

const serviceSeoOverrides: Record<string, { title: string; description: string; keywords: string[] }> = {
  "twitter-likes": {
    title: "Buy Twitter (X) Likes | X Likes Service | SocialRUSH",
    description: "Buy Twitter (X) likes for eligible public posts with transparent pricing, clear service requirements and dashboard order tracking from SocialRUSH.",
    keywords: ["buy Twitter likes", "buy X likes", "Twitter likes service", "X likes service", "Twitter likes India", "X likes India"],
  },
  "twitter-views": {
    title: "Buy Twitter (X) Views | X Views Service | SocialRUSH",
    description: "Buy Twitter (X) views for eligible public posts with transparent pricing, public-link ordering, clear requirements and dashboard tracking.",
    keywords: ["buy Twitter views", "buy X views", "Twitter views service", "X views service", "Twitter views India", "X views India"],
  },
  "twitter-retweets": {
    title: "Buy Twitter Retweets / X Reposts | SocialRUSH",
    description: "Order Twitter retweets, now commonly called X reposts, for eligible public posts with transparent pricing, clear requirements and dashboard tracking.",
    keywords: ["buy Twitter retweets", "buy X reposts", "Twitter retweet service", "X repost service", "Twitter retweets India", "X reposts India"],
  },
  "twitter-crypto-followers": {
    title: "Twitter (X) Crypto Followers Service | SocialRUSH",
    description: "Explore the Twitter (X) crypto followers service with current pricing, quantity limits, public-profile requirements and dashboard order tracking.",
    keywords: ["Twitter crypto followers", "X crypto followers", "crypto Twitter followers service", "crypto X followers service"],
  },
  "twitter-crypto-likes": {
    title: "Twitter (X) Crypto Likes Service | SocialRUSH",
    description: "Explore Twitter (X) crypto likes for eligible public posts with current pricing, service requirements and SocialRUSH dashboard tracking.",
    keywords: ["Twitter crypto likes", "X crypto likes", "crypto Twitter likes service", "crypto X likes service"],
  },
  "twitter-crypto-retweets": {
    title: "Twitter Crypto Retweets / X Crypto Reposts | SocialRUSH",
    description: "Explore Twitter crypto retweets, also described as X crypto reposts, with current service details, public-link requirements and dashboard tracking.",
    keywords: ["Twitter crypto retweets", "X crypto reposts", "crypto Twitter retweet service", "crypto X repost service"],
  },
  "twitter-crypto-custom-comments": {
    title: "Twitter (X) Crypto Custom Comments Service | SocialRUSH",
    description: "Order eligible Twitter (X) crypto custom comments using the required public post link and supplied comment text, with clear service details and tracking.",
    keywords: ["Twitter crypto comments", "X crypto comments", "Twitter custom comments service", "X custom comments service"],
  },
};

export function createCatalogServiceMetadata(serviceCode: string): Metadata {
  const service = activeSmmServices.find((item) => item.code === serviceCode);
  if (!service) return {};
  const platform = platformMeta[service.platform].label;
  const override = serviceSeoOverrides[serviceCode];
  const title = override?.title ?? `Buy ${service.name} | SocialRUSH`;
  const description = override?.description ?? `Order ${service.name} with transparent pricing, public-link ordering, service requirements and dashboard tracking. Review current ${platform} campaign details before checkout.`;
  const path = `/services/${service.code}`;

  return {
    metadataBase: new URL(SEO_SITE_URL),
    title: { absolute: title },
    description,
    keywords: override?.keywords,
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
