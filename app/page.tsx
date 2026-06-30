import HomepageContent from "@/components/marketing/HomepageContent";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Social Media Growth Services India",
  description:
    "SocialRUSH offers social media growth services in India for Instagram, YouTube, LinkedIn, Facebook, TikTok and X with transparent pricing and order tracking.",
  path: "/",
});

export default function HomePage() {
  return <HomepageContent />;
}
