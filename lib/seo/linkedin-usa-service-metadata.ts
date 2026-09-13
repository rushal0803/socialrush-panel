import type { Metadata } from "next";
import { SEO_SITE_URL } from "@/lib/seo/metadata";

type ServiceSeo = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
};

const serviceSeo: Record<string, ServiceSeo> = {
  "linkedin-usa-connections": {
    slug: "linkedin-usa-connections",
    title: "Buy LinkedIn USA Connections | US LinkedIn Connections | SocialRUSH",
    description: "Buy LinkedIn USA Connections for eligible public personal profiles. Review live pricing, delivery, quantity limits and place your order securely with SocialRUSH.",
    keywords: ["buy LinkedIn USA connections", "LinkedIn connections USA", "US LinkedIn connections", "LinkedIn connection service USA"],
  },
  "linkedin-usa-post-likes": {
    slug: "linkedin-usa-post-likes",
    title: "Buy LinkedIn USA Post Likes | US LinkedIn Likes | SocialRUSH",
    description: "Buy LinkedIn USA Post Likes for eligible public posts. Compare live pricing, delivery and quantity limits, then order securely and track progress in your dashboard.",
    keywords: ["buy LinkedIn USA post likes", "LinkedIn likes USA", "US LinkedIn post likes", "LinkedIn engagement USA"],
  },
  "linkedin-usa-endorsements": {
    slug: "linkedin-usa-endorsements",
    title: "Buy LinkedIn USA Endorsements | US Skill Endorsements | SocialRUSH",
    description: "Buy LinkedIn USA endorsements for one specified skill on an eligible public profile. Review live pricing, limits and delivery before ordering securely.",
    keywords: ["buy LinkedIn USA endorsements", "LinkedIn endorsements USA", "US LinkedIn skill endorsements", "LinkedIn skill endorsements"],
  },
  "linkedin-usa-followers": {
    slug: "linkedin-usa-followers",
    title: "Buy LinkedIn USA Followers | US LinkedIn Followers | SocialRUSH",
    description: "Buy LinkedIn USA Followers with transparent live pricing, public-link ordering, delivery details and dashboard tracking. No LinkedIn password required.",
    keywords: ["buy LinkedIn USA followers", "LinkedIn followers USA", "US LinkedIn followers", "LinkedIn followers service USA"],
  },
  "linkedin-usa-group-members": {
    slug: "linkedin-usa-group-members",
    title: "Buy LinkedIn USA Group Members | US LinkedIn Members | SocialRUSH",
    description: "Buy LinkedIn USA Group Members for eligible public LinkedIn groups. Review live pricing, quantity limits, delivery details and order securely with SocialRUSH.",
    keywords: ["buy LinkedIn USA group members", "LinkedIn group members USA", "US LinkedIn group members", "LinkedIn members USA"],
  },
  "linkedin-usa-custom-comments": {
    slug: "linkedin-usa-custom-comments",
    title: "Buy LinkedIn USA Custom Comments | US LinkedIn Comments | SocialRUSH",
    description: "Buy LinkedIn USA Custom Comments for eligible public posts using customer-provided text. Review live pricing, limits and delivery before secure checkout.",
    keywords: ["buy LinkedIn USA custom comments", "LinkedIn comments USA", "US LinkedIn custom comments", "LinkedIn post comments USA"],
  },
  "linkedin-usa-reposts": {
    slug: "linkedin-usa-reposts",
    title: "Buy LinkedIn USA Reposts | US LinkedIn Reposts | SocialRUSH",
    description: "Buy LinkedIn USA Reposts for eligible public posts. Review live pricing, delivery and quantity limits, then order securely and track progress from your dashboard.",
    keywords: ["buy LinkedIn USA reposts", "LinkedIn reposts USA", "US LinkedIn reposts", "LinkedIn shares USA"],
  },
};

export function createLinkedInUsaServiceMetadata(slug: string): Metadata {
  const seo = serviceSeo[slug];
  if (!seo) return {};
  const canonical = `/services/${seo.slug}`;
  return {
    metadataBase: new URL(SEO_SITE_URL),
    title: { absolute: seo.title },
    description: seo.description,
    keywords: seo.keywords,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: {
        "en-US": canonical,
        "x-default": canonical,
      },
    },
    openGraph: {
      type: "website",
      siteName: "SocialRUSH",
      locale: "en_US",
      title: seo.title,
      description: seo.description,
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
  };
}
