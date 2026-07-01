import IndiaServiceLandingPage from "@/components/marketing/services/IndiaServiceLandingPage";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";

export const metadata = getIndiaServiceMetadata("buy-telegram-members-india");

export default function Page() {
  return <IndiaServiceLandingPage slug="buy-telegram-members-india" />;
}
