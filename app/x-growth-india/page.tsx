import { createPageMetadata } from "@/lib/seo/metadata";
import PlatformGrowthHub from "@/components/marketing/PlatformGrowthHub";

export const metadata = createPageMetadata({
  title: "Twitter / X Growth Services India | Followers, Likes, Reposts & Views",
  description: "Compare Twitter / X growth services in India for followers, likes, reposts and views. Match account growth or post engagement to the right public-link service.",
  path: "/x-growth-india",
  keywords: [
    "Twitter growth services India",
    "X growth services India",
    "Twitter engagement services",
    "X engagement services",
    "Twitter followers India",
    "X followers India",
    "Twitter growth services India",
    "X social media growth India",
  ],
});

export default function XGrowthIndiaPage() {
  return <PlatformGrowthHub platform="twitter" />;
}
