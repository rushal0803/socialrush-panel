import ServiceSeoPage from "@/app/services/[slug]/page";
import { createLinkedInUsaServiceMetadata } from "@/lib/seo/linkedin-usa-service-metadata";

export const metadata = createLinkedInUsaServiceMetadata("linkedin-usa-connections");

export default async function LinkedInUsaConnectionsPage() {
  return ServiceSeoPage({ params: { slug: "linkedin-usa-connections" } });
}
