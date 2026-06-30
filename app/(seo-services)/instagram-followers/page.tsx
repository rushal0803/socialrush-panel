import SeoServiceLandingPage from "@/components/marketing/services/SeoServiceLandingPage";
import { getSeoServiceMetadata } from "@/lib/seo/service-landing-pages";

export const metadata = getSeoServiceMetadata("instagram-followers");

export default function InstagramFollowersPage() {
  return <SeoServiceLandingPage slug="instagram-followers" />;
}
