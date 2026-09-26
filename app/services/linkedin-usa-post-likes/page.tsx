import ServiceSeoPage from "@/app/services/[slug]/page";
import { createLinkedInUsaServiceMetadata } from "@/lib/seo/linkedin-usa-service-metadata";

export const metadata = createLinkedInUsaServiceMetadata("linkedin-usa-post-likes");

export default async function LinkedInUsaPostLikesPage() {
  return ServiceSeoPage({ params: Promise.resolve({ slug: "linkedin-usa-post-likes" }) });
}
