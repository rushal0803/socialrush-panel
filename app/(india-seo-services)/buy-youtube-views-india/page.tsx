import YouTubeViewsLanding from "@/components/marketing/YouTubeViewsLanding";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";

export const metadata = getIndiaServiceMetadata("buy-youtube-views-india");

export default function Page() {
  return <YouTubeViewsLanding />;
}
