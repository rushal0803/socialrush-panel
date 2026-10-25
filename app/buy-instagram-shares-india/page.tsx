import type { Metadata } from "next";
import IndiaServiceLandingPage from "@/components/marketing/services/IndiaServiceLandingPage";
import { createPageMetadata } from "@/lib/seo/metadata";
import MoneyPageAuthorityLinks from "@/components/seo/MoneyPageAuthorityLinks";

const path = "/buy-instagram-shares-india";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Buy Instagram Shares in India | INR Pricing | SocialRUSH",
    description: "Buy Instagram shares in India for public posts or Reels. Compare live INR prices, delivery and no-refill terms, and link requirements before checkout.",
    path,
    keywords: ["buy Instagram shares India", "Instagram shares service India"],
  }),
  robots: { index: true, follow: true },
};

export default function BuyInstagramSharesIndiaPage() {
  return <><IndiaServiceLandingPage slug="buy-instagram-shares-india" canonicalPath={path} /><MoneyPageAuthorityLinks platform="instagram" /></>;
}
