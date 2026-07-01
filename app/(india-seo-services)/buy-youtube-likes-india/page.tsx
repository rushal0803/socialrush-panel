import IndiaServiceLandingPage from "@/components/marketing/services/IndiaServiceLandingPage";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";

export const metadata = getIndiaServiceMetadata("buy-youtube-likes-india");

export default function Page() {
  return <IndiaServiceLandingPage slug="buy-youtube-likes-india" />;
}
