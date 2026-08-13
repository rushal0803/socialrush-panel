import LinkedInFollowersLanding from "@/components/marketing/LinkedInFollowersLanding";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";

export const metadata = getIndiaServiceMetadata("buy-linkedin-followers-india");

export default function Page() {
  return <LinkedInFollowersLanding />;
}
