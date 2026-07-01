import IndiaServiceLandingPage from "@/components/marketing/services/IndiaServiceLandingPage";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";

export const metadata = getIndiaServiceMetadata("buy-instagram-views-india");

export default function Page() {
  return <IndiaServiceLandingPage slug="buy-instagram-views-india" />;
}
