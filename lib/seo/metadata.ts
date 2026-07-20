import type { Metadata } from "next";

export const SEO_SITE_URL = "https://www.getsocialrush.com";

export const SOCIAL_GROWTH_KEYWORDS = [
  "Social media growth services India",
  "Buy Instagram followers India",
  "Buy YouTube subscribers India",
  "LinkedIn followers India",
  "Twitter followers India",
  "Instagram likes India",
  "YouTube views India",
];

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
};

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
}: PageMetadataOptions): Metadata {
  const canonicalUrl = new URL(path, `${SEO_SITE_URL}/`).toString();
  const pageTitle =
    title === "SocialRUSH"
      ? title
      : title.replace(/\s*\|\s*SocialRUSH\s*$/i, "").trim();
  const socialTitle = pageTitle.includes("SocialRUSH") ? pageTitle : `${pageTitle} | SocialRUSH`;
  const imageUrl = `${SEO_SITE_URL}/og-image.png`;

  return {
    title: pageTitle,
    description,
    keywords: [...new Set([...keywords, ...SOCIAL_GROWTH_KEYWORDS])],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: "SocialRUSH",
      title: socialTitle,
      description,
      url: canonicalUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: "SocialRUSH social media growth services for creators and brands",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [imageUrl],
    },
  };
}
