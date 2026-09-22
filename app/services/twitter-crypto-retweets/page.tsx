import PremiumCatalogServiceLanding from "@/components/marketing/services/PremiumCatalogServiceLanding";
import { createCatalogServiceMetadata } from "@/lib/seo/catalog-service-metadata";

export const metadata = createCatalogServiceMetadata("twitter-crypto-retweets");

export default function Page() {
  return <PremiumCatalogServiceLanding serviceCode="twitter-crypto-retweets" />;
}
