import ServiceSeoPage from "@/app/services/[slug]/page";
import { createLinkedInUsaServiceMetadata } from "@/lib/seo/linkedin-usa-service-metadata";

export const metadata = createLinkedInUsaServiceMetadata("linkedin-usa-custom-comments");

export default async function LinkedInUsaCustomCommentsPage() {
  return ServiceSeoPage({ params: { slug: "linkedin-usa-custom-comments" } });
}
