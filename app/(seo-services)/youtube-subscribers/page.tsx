import SeoServiceLandingPage from "@/components/marketing/services/SeoServiceLandingPage";
import { getSeoServiceMetadata } from "@/lib/seo/service-landing-pages";

export const metadata = getSeoServiceMetadata("youtube-subscribers");

export default function YoutubeSubscribersPage() {
  return <SeoServiceLandingPage slug="youtube-subscribers" />;
}
