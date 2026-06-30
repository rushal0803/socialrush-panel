import SeoServiceLandingPage from "@/components/marketing/services/SeoServiceLandingPage";
import { getSeoServiceMetadata } from "@/lib/seo/service-landing-pages";

export const metadata = getSeoServiceMetadata("youtube-likes");

export default function YoutubeLikesPage() {
  return <SeoServiceLandingPage slug="youtube-likes" />;
}
