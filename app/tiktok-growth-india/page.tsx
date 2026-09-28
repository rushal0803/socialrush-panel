import { createPageMetadata } from "@/lib/seo/metadata";
import PlatformGrowthHub from "@/components/marketing/PlatformGrowthHub";

export const metadata = createPageMetadata({
  title: "TikTok Growth Resources in India",
  description: "Explore practical TikTok growth resources and relevant follower and engagement options for Indian creators, brands and agencies.",
  path: "/tiktok-growth-india",
  keywords: ["TikTok growth services India", "TikTok social media growth India", "TikTok engagement services India"],
});

export default function TikTokGrowthIndiaPage() {
  return <PlatformGrowthHub platform="tiktok" />;
}
