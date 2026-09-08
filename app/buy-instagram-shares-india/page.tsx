import type { Metadata } from "next";
import IndiaServiceLandingPage from "@/components/marketing/services/IndiaServiceLandingPage";
import { createPageMetadata } from "@/lib/seo/metadata";

const path = "/buy-instagram-shares-india";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Buy Instagram Shares India | Live INR Plans | SocialRUSH",
    description: "Buy Instagram shares in India with live INR pricing, public post or Reel link ordering, no password required and SocialRUSH dashboard tracking.",
    path,
    keywords: ["buy Instagram shares India", "Instagram shares service India"],
  }),
  robots: { index: true, follow: true },
};

export default function BuyInstagramSharesIndiaPage() {
  return <IndiaServiceLandingPage slug="buy-instagram-shares-india" canonicalPath={path} />;
}
