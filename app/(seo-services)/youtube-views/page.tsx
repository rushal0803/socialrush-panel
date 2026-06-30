import SeoServiceLandingPage from "@/components/marketing/services/SeoServiceLandingPage";
import { getSeoServiceMetadata } from "@/lib/seo/service-landing-pages";

export const metadata = getSeoServiceMetadata("youtube-views");

export default function YoutubeViewsPage() {
  return <SeoServiceLandingPage slug="youtube-views" />;
}
