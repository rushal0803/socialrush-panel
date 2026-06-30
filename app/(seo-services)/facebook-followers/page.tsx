import SeoServiceLandingPage from "@/components/marketing/services/SeoServiceLandingPage";
import { getSeoServiceMetadata } from "@/lib/seo/service-landing-pages";

export const metadata = getSeoServiceMetadata("facebook-followers");

export default function FacebookFollowersPage() {
  return <SeoServiceLandingPage slug="facebook-followers" />;
}
