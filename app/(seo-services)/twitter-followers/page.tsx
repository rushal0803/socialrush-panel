import SeoServiceLandingPage from "@/components/marketing/services/SeoServiceLandingPage";
import { getSeoServiceMetadata } from "@/lib/seo/service-landing-pages";

export const metadata = getSeoServiceMetadata("twitter-followers");

export default function TwitterFollowersPage() {
  return <SeoServiceLandingPage slug="twitter-followers" />;
}
