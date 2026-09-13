import ServiceSeoPage from "@/app/services/[slug]/page";
import { createLinkedInUsaServiceMetadata } from "@/lib/seo/linkedin-usa-service-metadata";

export const metadata = createLinkedInUsaServiceMetadata("linkedin-usa-endorsements");

export default async function LinkedInUsaEndorsementsPage() {
  return ServiceSeoPage({ params: { slug: "linkedin-usa-endorsements" } });
}
