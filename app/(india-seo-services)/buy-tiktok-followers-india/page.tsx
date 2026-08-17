import TikTokFollowersLanding from "@/components/marketing/TikTokFollowersLanding";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";

export const metadata = getIndiaServiceMetadata("buy-tiktok-followers-india");

export default function Page() {
  return <TikTokFollowersLanding />;
}
