import PremiumCatalogServiceLanding from "@/components/marketing/services/PremiumCatalogServiceLanding";
import { createCatalogServiceMetadata } from "@/lib/seo/catalog-service-metadata";

export const metadata = createCatalogServiceMetadata("twitter-crypto-followers");

export default function Page() {
  return <PremiumCatalogServiceLanding serviceCode="twitter-crypto-followers" />;
}
