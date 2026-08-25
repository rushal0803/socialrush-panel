import type { Metadata } from "next";
import InstagramSavesLanding from "@/components/marketing/services/InstagramSavesLanding";
import { SEO_SITE_URL } from "@/lib/seo/metadata";
import { getLiveServiceFacts } from "@/lib/seo/live-service";

const path = "/buy-instagram-saves-india";

export const metadata: Metadata = {
  title: { absolute: "Buy Instagram Saves India | SocialRUSH" },
  description: "Buy Instagram Saves in India for an eligible public post or Reel. Review transparent live pricing, delivery details and dashboard tracking with SocialRUSH.",
  alternates: { canonical: `${SEO_SITE_URL}${path}` },
  robots: { index: true, follow: true },
};

export default async function BuyInstagramSavesIndiaPage() {
  const live = await getLiveServiceFacts("instagram", "Instagram Saves");
  return <InstagramSavesLanding live={live} canonicalUrl={`${SEO_SITE_URL}${path}`} />;
}
