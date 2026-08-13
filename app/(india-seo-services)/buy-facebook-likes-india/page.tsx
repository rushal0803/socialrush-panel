import FacebookLikesLanding from "@/components/marketing/FacebookLikesLanding";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";

export const metadata = getIndiaServiceMetadata("buy-facebook-likes-india");

export default function Page() {
  return <FacebookLikesLanding />;
}
