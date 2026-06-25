import type { Metadata } from "next";
import BlogPageContent from "@/components/marketing/blog/BlogPageContent";

export const metadata: Metadata = {
  title: "SocialRUSH Blog | Growth Insights & Strategies",
  description:
    "SocialRUSH resource hub with practical social growth insights, campaign strategies, and platform-specific tips for creators, brands, and agencies.",
};

export default function BlogPage() {
  return <BlogPageContent />;
}
