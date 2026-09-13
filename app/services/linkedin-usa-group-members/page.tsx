import ServiceSeoPage from "@/app/services/[slug]/page";
import { createLinkedInUsaServiceMetadata } from "@/lib/seo/linkedin-usa-service-metadata";

export const metadata = createLinkedInUsaServiceMetadata("linkedin-usa-group-members");

export default async function LinkedInUsaGroupMembersPage() {
  return ServiceSeoPage({ params: { slug: "linkedin-usa-group-members" } });
}
