import SeoServiceLandingPage from "@/components/marketing/services/SeoServiceLandingPage";
import { getSeoServiceMetadata } from "@/lib/seo/service-landing-pages";

export const metadata = getSeoServiceMetadata("instagram-likes");

export default function InstagramLikesPage() {
  return <SeoServiceLandingPage slug="instagram-likes" />;
}
