import type { Metadata } from "next";
import HomepageContent from "@/components/marketing/HomepageContent";

export const metadata: Metadata = {
  title: "SocialRUSH | Premium Social Media Growth Services",
  description:
    "SocialRUSH helps creators, influencers, businesses, and agencies order premium followers, likes, views, subscribers, and members across top social platforms.",
  keywords: [
    "instagram followers",
    "youtube subscribers",
    "social media growth services",
    "tiktok followers",
    "telegram members",
    "linkedin likes",
    "facebook followers",
    "twitter followers",
  ],
  alternates: { canonical: "https://socialrush-panel.vercel.app" },
  openGraph: {
    title: "SocialRUSH | Trusted Social Media Growth Services",
    description:
      "Premium multi-platform social media growth services with transparent packages, secure ordering, and order tracking.",
    url: "https://socialrush-panel.vercel.app",
    siteName: "SocialRUSH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SocialRUSH Social Media Growth Platform",
    description:
      "Buy followers, likes, views, subscribers, and members with a clean, trackable workflow.",
  },
};

export default function HomePage() {
  return <HomepageContent />;
}