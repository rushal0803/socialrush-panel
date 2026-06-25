import type { Metadata } from "next";
import PackagesPageContent from "@/components/marketing/packages/PackagesPageContent";

export const metadata: Metadata = {
  title: "SocialRUSH Packages | Premium Growth Plans",
  description:
    "Explore premium SocialRUSH growth packages for Instagram, YouTube, Facebook, LinkedIn, TikTok, and X/Twitter with secure checkout and campaign tracking.",
};

export default function PackagesPage() {
  return <PackagesPageContent />;
}
