import type { Metadata } from "next";
import IndiaServiceLandingPage from "@/components/marketing/services/IndiaServiceLandingPage";
import { buildInstagramSerpMetadata } from "@/lib/seo/instagram-serp";
import IndiaCommercialServiceJsonLd from "@/components/seo/IndiaCommercialServiceJsonLd";
import MoneyPageAuthorityLinks from "@/components/seo/MoneyPageAuthorityLinks";

const path = "/buy-instagram-shares-india";

export const metadata: Metadata = buildInstagramSerpMetadata("shares");

export default function BuyInstagramSharesIndiaPage() {
  return <><IndiaCommercialServiceJsonLd code="instagram-shares" name="Instagram Shares" path={path} platform="Instagram" serviceType="Instagram shares service" /><IndiaServiceLandingPage slug="buy-instagram-shares-india" canonicalPath={path} /><MoneyPageAuthorityLinks platform="instagram" /></>;
}
