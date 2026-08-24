import type { Metadata } from "next";
import IndiaServiceLandingPage from "@/components/marketing/services/IndiaServiceLandingPage";
import { SEO_SITE_URL } from "@/lib/seo/metadata";

const path = "/buy-instagram-shares-india";

export const metadata: Metadata = {
  title: { absolute: "Buy Instagram Shares India | SocialRUSH" },
  description: "Buy Instagram shares in India with transparent pricing, fast delivery, and a simple secure ordering experience from SocialRUSH.",
  alternates: { canonical: `${SEO_SITE_URL}${path}` },
  robots: { index: true, follow: true },
};

export default function BuyInstagramSharesIndiaPage() {
  return <IndiaServiceLandingPage slug="buy-instagram-shares-india" canonicalPath={path} />;
}
