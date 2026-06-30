import SeoServiceLandingPage from "@/components/marketing/services/SeoServiceLandingPage";
import { getSeoServiceMetadata } from "@/lib/seo/service-landing-pages";

export const metadata = getSeoServiceMetadata("linkedin-followers");

export default function LinkedinFollowersPage() {
  return <SeoServiceLandingPage slug="linkedin-followers" />;
}
