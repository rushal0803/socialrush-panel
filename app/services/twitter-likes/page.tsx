import ServiceSeoPage from "../[slug]/page";
import { createCatalogServiceMetadata } from "@/lib/seo/catalog-service-metadata";

export const metadata = createCatalogServiceMetadata("twitter-likes");

export default function Page() {
  return <ServiceSeoPage params={Promise.resolve({ slug: "twitter-likes" })} />;
}
