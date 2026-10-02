import type { Metadata } from "next";
import { SEO_SITE_URL } from "@/lib/seo/metadata";

export type InstagramSerpKey =
  | "followers"
  | "likes"
  | "views"
  | "comments"
  | "saves"
  | "shares";

export type InstagramSerpProfile = {
  key: InstagramSerpKey;
  title: string;
  description: string;
  path: string;
  breadcrumbName: string;
};

export const instagramSerpProfiles: Record<InstagramSerpKey, InstagramSerpProfile> = {
  followers: {
    key: "followers",
    title: "Buy Instagram Followers in India | INR Pricing | SocialRUSH",
    description: "Live INR pricing for Instagram followers in India. Choose a quantity, use a public profile link, review delivery/refill details, and order securely.",
    path: "/buy-instagram-followers-india",
    breadcrumbName: "Instagram Followers",
  },
  likes: {
    key: "likes",
    title: "Buy Instagram Likes in India | INR Pricing | SocialRUSH",
    description: "Live INR pricing for Instagram likes in India. Choose a quantity, add a public post or Reel link, review delivery/refill details, and order securely.",
    path: "/instagram-likes",
    breadcrumbName: "Instagram Likes",
  },
  views: {
    key: "views",
    title: "Buy Instagram Views in India | INR Pricing | SocialRUSH",
    description: "Live INR pricing for Instagram views in India. Choose a quantity, add a public Reel or video link, review delivery/refill details, and order securely.",
    path: "/instagram-views",
    breadcrumbName: "Instagram Views",
  },
  comments: {
    key: "comments",
    title: "Buy Instagram Comments in India | INR Pricing | SocialRUSH",
    description: "Live INR pricing for Instagram comments in India. Choose a quantity, add a public post or Reel link, review delivery details, and order securely.",
    path: "/buy-instagram-comments-india",
    breadcrumbName: "Instagram Comments",
  },
  saves: {
    key: "saves",
    title: "Buy Instagram Saves in India | INR Pricing | SocialRUSH",
    description: "Live INR pricing for Instagram saves in India. Choose a quantity, add a public post or Reel link, review delivery/support details, and order securely.",
    path: "/buy-instagram-saves-india",
    breadcrumbName: "Instagram Saves",
  },
  shares: {
    key: "shares",
    title: "Buy Instagram Shares in India | INR Pricing | SocialRUSH",
    description: "Live INR pricing for Instagram shares in India. Choose a quantity, add a public post or Reel link, review delivery/support details, and order securely.",
    path: "/buy-instagram-shares-india",
    breadcrumbName: "Instagram Shares",
  },
};

export function getInstagramSerpProfile(key: InstagramSerpKey) {
  return instagramSerpProfiles[key];
}

export function buildInstagramSerpMetadata(
  key: InstagramSerpKey,
  options: { imagePath?: string; imageAlt?: string } = {},
): Metadata {
  const profile = getInstagramSerpProfile(key);
  const url = new URL(profile.path, `${SEO_SITE_URL}/`).toString();
  const imagePath = options.imagePath ?? "/og-image.png";
  const imageUrl = new URL(imagePath, `${SEO_SITE_URL}/`).toString();

  return {
    title: { absolute: profile.title },
    description: profile.description,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: "SocialRUSH",
      title: profile.title,
      description: profile.description,
      url,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: options.imageAlt ?? `${profile.breadcrumbName} in India | SocialRUSH`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: profile.title,
      description: profile.description,
      images: [imageUrl],
    },
  };
}
