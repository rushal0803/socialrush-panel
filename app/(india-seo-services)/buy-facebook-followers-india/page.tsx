import FacebookFollowersLanding from "@/components/marketing/FacebookFollowersLanding";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";

export const metadata = getIndiaServiceMetadata("buy-facebook-followers-india");

export default function Page() {
  return <FacebookFollowersLanding />;
}
