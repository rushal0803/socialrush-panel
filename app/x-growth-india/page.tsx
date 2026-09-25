import { createPageMetadata } from "@/lib/seo/metadata";
import PlatformGrowthHub from "@/components/marketing/PlatformGrowthHub";

export const metadata = createPageMetadata({
  title: "Twitter / X Growth Services India | Followers & Engagement | SocialRUSH",
  description: "Explore Twitter / X growth services and practical resources for India, including follower and engagement options, public-link requirements and related guides.",
  path: "/x-growth-india",
  keywords: [
    "Twitter growth services India",
    "X growth services India",
    "Twitter engagement services",
    "X engagement services",
    "Twitter followers India",
    "X followers India",
  ],
});

export default function XGrowthIndiaPage() {
  return <PlatformGrowthHub platform="twitter" />;
}
