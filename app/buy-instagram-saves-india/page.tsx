import type { Metadata } from "next";
import InstagramSavesLanding from "@/components/marketing/services/InstagramSavesLanding";
import { createPageMetadata, SEO_SITE_URL } from "@/lib/seo/metadata";
import { getLiveServiceFacts } from "@/lib/seo/live-service";
import IndiaCommercialServiceJsonLd from "@/components/seo/IndiaCommercialServiceJsonLd";
import MoneyPageAuthorityLinks from "@/components/seo/MoneyPageAuthorityLinks";

const path = "/buy-instagram-saves-india";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Buy Instagram Saves India | Live INR Plans | SocialRUSH",
    description: "Buy Instagram saves in India with live INR pricing, public post or Reel link ordering, no password required and SocialRUSH dashboard tracking.",
    path,
    keywords: ["buy Instagram saves India", "Instagram saves service India"],
  }),
  robots: { index: true, follow: true },
};

export default async function BuyInstagramSavesIndiaPage() {
  const live = await getLiveServiceFacts("instagram", "Instagram Saves");
  return <><IndiaCommercialServiceJsonLd code="instagram-saves" name="Instagram Saves" path={path} platform="Instagram" serviceType="Instagram saves service" /><InstagramSavesLanding live={live} canonicalUrl={`${SEO_SITE_URL}${path}`} /><MoneyPageAuthorityLinks platform="instagram" /></>;
}
