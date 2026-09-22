import PremiumCatalogServiceLanding from "@/components/marketing/services/PremiumCatalogServiceLanding";
import { createCatalogServiceMetadata } from "@/lib/seo/catalog-service-metadata";

export const metadata = createCatalogServiceMetadata("telegram-post-reactions");

export default function Page() {
  return <PremiumCatalogServiceLanding serviceCode="telegram-post-reactions" />;
}
