import PremiumCatalogServiceLanding from "@/components/marketing/services/PremiumCatalogServiceLanding";
import { createCatalogServiceMetadata } from "@/lib/seo/catalog-service-metadata";

export const metadata = createCatalogServiceMetadata("tiktok-saves");

export default function Page() {
  return <PremiumCatalogServiceLanding serviceCode="tiktok-saves" />;
}
