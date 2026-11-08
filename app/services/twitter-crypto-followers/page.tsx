import ServiceSeoPage from "../[slug]/page";
import { createCatalogServiceMetadata } from "@/lib/seo/catalog-service-metadata";

export const metadata = createCatalogServiceMetadata("twitter-crypto-followers");

export default function Page() {
  return <ServiceSeoPage params={Promise.resolve({ slug: "twitter-crypto-followers" })} />;
}
