import type { Metadata } from "next";
import InstagramSavesLanding from "@/components/marketing/services/InstagramSavesLanding";
import { buildInstagramSerpMetadata } from "@/lib/seo/instagram-serp";
import { getLiveServiceFacts } from "@/lib/seo/live-service";
import IndiaCommercialServiceJsonLd from "@/components/seo/IndiaCommercialServiceJsonLd";
import MoneyPageAuthorityLinks from "@/components/seo/MoneyPageAuthorityLinks";

const path = "/buy-instagram-saves-india";

export const metadata: Metadata = buildInstagramSerpMetadata("saves");

export default async function BuyInstagramSavesIndiaPage() {
  const live = await getLiveServiceFacts("instagram", "Instagram Saves");
  return <><IndiaCommercialServiceJsonLd code="instagram-saves" name="Instagram Saves" path={path} platform="Instagram" serviceType="Instagram saves service" /><InstagramSavesLanding live={live} /><MoneyPageAuthorityLinks platform="instagram" /></>;
}
