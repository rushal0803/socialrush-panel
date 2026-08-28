import type { Metadata } from "next";
import IndiaServiceLandingPage from "@/components/marketing/services/IndiaServiceLandingPage";
import { createPageMetadata } from "@/lib/seo/metadata";

const path = "/buy-instagram-shares-india";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Buy Instagram Shares in India | SocialRUSH",
    description: "Buy Instagram Shares in India with transparent live pricing, public post or Reel ordering, and dashboard tracking from SocialRUSH.",
    path,
    keywords: ["buy Instagram shares India", "Instagram shares service India"],
  }),
  robots: { index: true, follow: true },
};

export default function BuyInstagramSharesIndiaPage() {
  return <IndiaServiceLandingPage slug="buy-instagram-shares-india" canonicalPath={path} />;
}
