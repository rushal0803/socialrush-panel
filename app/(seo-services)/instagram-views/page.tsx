import SeoServiceLandingPage from "@/components/marketing/services/SeoServiceLandingPage";
import { getSeoServiceMetadata } from "@/lib/seo/service-landing-pages";

export const metadata = getSeoServiceMetadata("instagram-views");

export default function InstagramViewsPage() {
  return <SeoServiceLandingPage slug="instagram-views" />;
}
