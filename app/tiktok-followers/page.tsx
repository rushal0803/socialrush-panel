import type { Metadata } from "next";
import PremiumCatalogServiceLanding from "@/components/marketing/services/PremiumCatalogServiceLanding";
import { SEO_SITE_URL } from "@/lib/seo/metadata";

const path = "/tiktok-followers";
const title = "Buy TikTok Followers India | Live INR Plans | SocialRUSH";
const description =
  "Buy TikTok followers in India for an eligible public profile with live INR pricing, quantity limits, delivery details, refill terms and dashboard tracking.";

export const metadata: Metadata = {
  metadataBase: new URL(SEO_SITE_URL),
  title: { absolute: title },
  description,
  keywords: [
    "buy TikTok followers India",
    "TikTok followers India",
    "buy TikTok followers",
    "TikTok follower service India",
  ],
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

export default function Page() {
  return <PremiumCatalogServiceLanding serviceCode="tiktok-followers" canonicalPath={path} />;
}
