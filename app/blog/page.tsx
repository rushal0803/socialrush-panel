import BlogPageContent from "@/components/marketing/blog/BlogPageContent";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Social Media Growth Blog India",
  description:
    "Read practical guides about Instagram growth, YouTube views and subscribers, LinkedIn followers, Twitter growth and social media campaign planning in India.",
  path: "/blog",
  keywords: ["social media growth blog India", "Instagram growth guides India"],
});

export default function BlogPage() {
  return <BlogPageContent />;
}
