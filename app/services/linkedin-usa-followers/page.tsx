import ServiceSeoPage from "@/app/services/[slug]/page";
import { createLinkedInUsaServiceMetadata } from "@/lib/seo/linkedin-usa-service-metadata";

export const metadata = createLinkedInUsaServiceMetadata("linkedin-usa-followers");

export default async function LinkedInUsaFollowersPage() {
  return ServiceSeoPage({ params: { slug: "linkedin-usa-followers" } });
}
