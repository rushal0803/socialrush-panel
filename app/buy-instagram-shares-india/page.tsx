import type { Metadata } from "next";
import PublicShell from "@/components/marketing/PublicShell";
import InteractiveHomepageShell from "@/components/marketing/InteractiveHomepageShell";
import InstagramSharesLanding from "@/components/marketing/services/InstagramSharesLanding";
import IndiaCommercialServiceJsonLd from "@/components/seo/IndiaCommercialServiceJsonLd";
import MoneyPageAuthorityLinks from "@/components/seo/MoneyPageAuthorityLinks";
import { getLiveServiceFacts } from "@/lib/seo/live-service";
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

export default async function BuyInstagramSharesIndiaPage() {
  const live = await getLiveServiceFacts("instagram", "Instagram Shares");

  return (
    <PublicShell>
      <IndiaCommercialServiceJsonLd
        code="instagram-shares"
        name="Instagram Shares"
        path={path}
        platform="Instagram"
        serviceType="Instagram shares service"
      />
      <InteractiveHomepageShell>
        <div className="service-money-page">
          <InstagramSharesLanding live={live} />
          <MoneyPageAuthorityLinks platform="instagram" />
        </div>
      </InteractiveHomepageShell>
    </PublicShell>
  );
}
