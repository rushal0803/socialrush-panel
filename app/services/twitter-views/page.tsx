import ServiceSeoPage from "../[slug]/page";
import { createCatalogServiceMetadata } from "@/lib/seo/catalog-service-metadata";

export const metadata = createCatalogServiceMetadata("twitter-views");

export default function Page() {
  return <ServiceSeoPage params={Promise.resolve({ slug: "twitter-views" })} />;
}
