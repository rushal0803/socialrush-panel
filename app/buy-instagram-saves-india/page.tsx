import type { Metadata } from "next";
import InstagramSavesLanding from "@/components/marketing/services/InstagramSavesLanding";
import { createPageMetadata, SEO_SITE_URL } from "@/lib/seo/metadata";
import { getLiveServiceFacts } from "@/lib/seo/live-service";
import MoneyPageAuthorityLinks from "@/components/seo/MoneyPageAuthorityLinks";

const path = "/buy-instagram-saves-india";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Buy Instagram Saves in India | INR Pricing | SocialRUSH",
    description: "Buy Instagram saves for public posts or Reels in India. Compare live INR rates, quantity limits and delivery terms before checkout. No password needed.",
    path,
    keywords: ["buy Instagram saves India", "Instagram saves service India"],
  }),
  robots: { index: true, follow: true },
};

export default async function BuyInstagramSavesIndiaPage() {
  const live = await getLiveServiceFacts("instagram", "Instagram Saves");
  return <><InstagramSavesLanding live={live} canonicalUrl={`${SEO_SITE_URL}${path}`} /><MoneyPageAuthorityLinks platform="instagram" /></>;
}
