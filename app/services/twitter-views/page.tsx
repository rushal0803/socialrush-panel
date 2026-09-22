import PremiumCatalogServiceLanding from "@/components/marketing/services/PremiumCatalogServiceLanding";
import { createCatalogServiceMetadata } from "@/lib/seo/catalog-service-metadata";

export const metadata = createCatalogServiceMetadata("twitter-views");

export default function Page() {
  return <PremiumCatalogServiceLanding serviceCode="twitter-views" />;
}
