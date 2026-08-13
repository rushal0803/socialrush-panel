import FacebookViewsLanding from "@/components/marketing/FacebookViewsLanding";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";

export const metadata = getIndiaServiceMetadata("buy-facebook-views-india");

export default function Page() {
  return <FacebookViewsLanding />;
}
