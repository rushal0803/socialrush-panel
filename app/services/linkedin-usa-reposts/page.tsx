import ServiceSeoPage from "@/app/services/[slug]/page";
import { createLinkedInUsaServiceMetadata } from "@/lib/seo/linkedin-usa-service-metadata";

export const metadata = createLinkedInUsaServiceMetadata("linkedin-usa-reposts");

export default async function LinkedInUsaRepostsPage() {
  return ServiceSeoPage({ params: { slug: "linkedin-usa-reposts" } });
}
