import PremiumCatalogServiceLanding from "@/components/marketing/services/PremiumCatalogServiceLanding";
import { createCatalogServiceMetadata } from "@/lib/seo/catalog-service-metadata";

export const metadata = createCatalogServiceMetadata("telegram-poll-votes");

export default function Page() {
  return <PremiumCatalogServiceLanding serviceCode="telegram-poll-votes" />;
}
