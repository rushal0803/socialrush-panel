import IndiaServiceLandingPage from "@/components/marketing/services/IndiaServiceLandingPage";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";

export const metadata = getIndiaServiceMetadata("buy-linkedin-likes-india");

export default function Page() {
  return <IndiaServiceLandingPage slug="buy-linkedin-likes-india" />;
}
